import type {
  CheckinClassification,
  DailyDirectives,
  HoyolabCheckinAward,
  ParametricCooldownParams,
  RawGeetestData,
  ResinEtaSummary,
} from "@/types/genshin";

export const RESIN_REGEN_SECONDS = 480; // 8 minutes
export const RESIN_REGEN_MS = RESIN_REGEN_SECONDS * 1000;

export type {
  CheckinClassification,
  ParametricCooldownParams,
  RawGeetestData,
  ResinEtaSummary,
};

/**
 * Pure domain progression engine for player daily directives, monotonic resin
 * calculations, countdown formatting, UTC+8 calendar day logic, and HoYoLAB daily check-in.
 *
 * Guaranteed zero-I/O, zero network calls, zero React hooks, zero localStorage access.
 */

export function reconcileResin(
  directives: DailyDirectives,
  nowMs = Date.now()
): DailyDirectives {
  const lastMs = Date.parse(directives.lastUpdatedAt);
  const maxResin = directives.maxResin > 0 ? directives.maxResin : 200;
  if (!Number.isFinite(lastMs) || directives.resin >= maxResin) {
    return {
      ...directives,
      maxResin,
      resinRecoverySeconds: 0,
    };
  }

  const elapsedMs = Math.max(0, nowMs - lastMs);
  const gained = Math.floor(elapsedMs / RESIN_REGEN_MS);
  const nextResin = Math.min(maxResin, directives.resin + gained);

  if (nextResin >= maxResin) {
    return {
      ...directives,
      resin: maxResin,
      maxResin,
      resinRecoverySeconds: 0,
      lastUpdatedAt: new Date(nowMs).toISOString(),
    };
  }

  const elapsedInCycleMs = elapsedMs % RESIN_REGEN_MS;
  const elapsedInCycleSeconds = Math.floor(elapsedInCycleMs / 1000);
  const secondsToNextPoint = Math.max(0, RESIN_REGEN_SECONDS - elapsedInCycleSeconds);
  const remainingCyclesAfterNext = Math.max(0, maxResin - nextResin - 1);
  const totalRecoverySeconds = remainingCyclesAfterNext * RESIN_REGEN_SECONDS + secondsToNextPoint;

  return {
    ...directives,
    resin: nextResin,
    maxResin,
    resinRecoverySeconds: totalRecoverySeconds,
    lastUpdatedAt:
      gained > 0
        ? new Date(lastMs + gained * RESIN_REGEN_MS).toISOString()
        : directives.lastUpdatedAt,
  };
}

export function calculateResinEta(directives: DailyDirectives): ResinEtaSummary {
  const maxResin = directives.maxResin > 0 ? directives.maxResin : 200;
  const currentResin = Math.max(0, Math.min(maxResin, directives.resin));
  const percentage = Math.round((currentResin / maxResin) * 100);

  if (currentResin >= maxResin) {
    return {
      isCapped: true,
      remainingMinutes: 0,
      hours: 0,
      minutes: 0,
      percentage: 100,
      label: "Fully Replenished (Capped)",
    };
  }

  const remainingPoints = maxResin - currentResin;
  const remainingMinutes = remainingPoints * 8;
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  return {
    isCapped: false,
    remainingMinutes,
    hours,
    minutes,
    percentage,
    label: `Full in ~${hours}h ${minutes}m`,
  };
}

export function formatParametricCooldown(
  params: ParametricCooldownParams
): { ready: boolean; label: string } {
  if (params.obtained === false) {
    return { ready: false, label: "Not unlocked" };
  }

  if (params.reached) {
    return { ready: true, label: "Ready to use" };
  }

  const d = params.days ?? 0;
  const h = params.hours ?? 0;
  const m = params.minutes ?? 0;

  if (d > 0) {
    return { ready: false, label: `${d}d ${h}h cooldown` };
  }

  if (h > 0 || m > 0) {
    return { ready: false, label: `${h}h ${m}m cooldown` };
  }

  return { ready: false, label: "Cooldown active" };
}

export function getHoyolabUtc8Date(now = new Date()): string {
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const year = utc8.getUTCFullYear();
  const month = String(utc8.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utc8.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function resolveTodayReward(
  awards: HoyolabCheckinAward[],
  totalSignDays: number,
  checkedInToday: boolean
): HoyolabCheckinAward | undefined {
  if (awards.length === 0) return undefined;
  const idx = checkedInToday
    ? Math.min(awards.length - 1, Math.max(0, totalSignDays - 1))
    : Math.min(awards.length - 1, Math.max(0, totalSignDays));
  return awards[idx];
}

export function classifyCheckinRetcode(
  retcode: number,
  rawData?: RawGeetestData
): CheckinClassification {
  if (retcode === 0) {
    const isRisk =
      Boolean(rawData?.is_risk) ||
      Boolean(rawData?.gt) ||
      Number(rawData?.success ?? 0) === 1;

    if (isRisk) {
      return {
        status: "risk_challenge",
        isRiskChallenge: true,
        retcode,
        message:
          "HoYoLAB requested human verification (CAPTCHA). Claim once on act.hoyolab.com, then click Manual Check-In to refresh.",
      };
    }

    return {
      status: "success",
      isRiskChallenge: false,
      retcode: 0,
    };
  }

  if (retcode === -5003) {
    return {
      status: "already_claimed",
      isRiskChallenge: false,
      retcode,
      message: "Already checked in for today.",
    };
  }

  if (retcode === 1034 || retcode === 5003 || retcode === 10035 || retcode === 10041) {
    return {
      status: "risk_challenge",
      isRiskChallenge: true,
      retcode,
      message:
        "HoYoLAB requested human verification (CAPTCHA). Claim once on act.hoyolab.com, then click Manual Check-In to refresh.",
    };
  }

  if (retcode === -100 || retcode === 10001 || retcode === -1071) {
    return {
      status: "auth_expired",
      isRiskChallenge: false,
      retcode,
      message: `HoYoLAB session cookies are invalid or expired (code ${retcode}).`,
    };
  }

  if (retcode === -10002) {
    return {
      status: "not_found",
      isRiskChallenge: false,
      retcode,
      message: "No Genshin Impact account is bound to these HoYoLAB cookies (code -10002).",
    };
  }

  if (retcode === -110 || retcode === 10101 || retcode === 1028) {
    return {
      status: "rate_limited",
      isRiskChallenge: false,
      retcode,
      message: "HoYoLAB rate limit reached. Please wait a minute before checking in again.",
    };
  }

  return {
    status: "error",
    isRiskChallenge: false,
    retcode,
    message: `HoYoLAB check-in error (${retcode}).`,
  };
}
