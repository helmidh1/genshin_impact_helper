import { resolveHoyolabAuth, type HoyolabAuthConfig } from "@/lib/hoyolab";
import type {
  HoyolabCheckinAction,
  HoyolabCheckinAward,
  HoyolabCheckinRequest,
  HoyolabCheckinState,
} from "@/types/genshin";

export function getHoyolabUtc8Date(now = new Date()): string {
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const year = utc8.getUTCFullYear();
  const month = String(utc8.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utc8.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const GENSHIN_CHECKIN_ACT_ID = "e202102251931481";
const GENSHIN_CHECKIN_BASE = "https://sg-hk4e-api.hoyolab.com/event/sol";
const DEFAULT_CHECKIN_LANG = "en-us";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

interface HoyolabRawResponse<T> {
  retcode: number;
  message?: string;
  data?: T;
}

interface SolInfoData {
  total_sign_day?: number;
  today?: string;
  is_sign?: boolean;
  sign_cnt_missed?: number;
}

interface SolHomeData {
  month?: number;
  awards?: Array<{
    icon?: string;
    name?: string;
    cnt?: number;
  }>;
}

interface SolSignData {
  gt?: string;
  challenge?: string;
  success?: number;
  is_risk?: boolean;
}

export class HoyolabCheckinError extends Error {
  status: number;
  retcode?: number;

  constructor(status: number, message: string, retcode?: number) {
    super(message);
    this.status = status;
    this.retcode = retcode;
  }
}

function sanitizeLang(raw?: string): string {
  const cleaned = raw?.trim().toLowerCase() ?? "";
  return /^[a-z]{2}(-[a-z]{2})?$/.test(cleaned)
    ? cleaned
    : DEFAULT_CHECKIN_LANG;
}

function buildCheckinHeaders(
  auth: HoyolabAuthConfig,
  includeJsonContentType = false
): Record<string, string> {
  return {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.6",
    Cookie: auth.cookieHeader,
    Origin: "https://act.hoyolab.com",
    Referer: "https://act.hoyolab.com/",
    "User-Agent": USER_AGENT,
    "x-rpc-signgame": "gi",
    ...(includeJsonContentType
      ? { "Content-Type": "application/json;charset=UTF-8" }
      : {}),
  };
}

async function fetchSolApi<T>(params: {
  endpoint: "info" | "home" | "sign";
  method: "GET" | "POST";
  lang: string;
  auth: HoyolabAuthConfig;
}): Promise<HoyolabRawResponse<T>> {
  const url = new URL(`${GENSHIN_CHECKIN_BASE}/${params.endpoint}`);
  url.searchParams.set("lang", params.lang);
  url.searchParams.set("act_id", GENSHIN_CHECKIN_ACT_ID);

  const isPost = params.method === "POST";
  const res = await fetch(url.toString(), {
    method: params.method,
    headers: buildCheckinHeaders(params.auth, isPost),
    body: isPost
      ? JSON.stringify({ lang: params.lang, act_id: GENSHIN_CHECKIN_ACT_ID })
      : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new HoyolabCheckinError(
      502,
      `HoYoLAB check-in service returned HTTP ${res.status}.`
    );
  }

  return (await res.json()) as HoyolabRawResponse<T>;
}

function throwIfHoyolabFailure(
  retcode: number,
  message: string | undefined,
  auth: HoyolabAuthConfig
): void {
  if (retcode === 0) return;

  if (retcode === -100 || retcode === 10001 || retcode === -1071) {
    const midHint =
      auth.hasV2Token && !auth.hasMid
        ? " Your token uses v2_ format—make sure you also include ltmid_v2 from hoyolab.com cookies."
        : "";
    throw new HoyolabCheckinError(
      401,
      `HoYoLAB session cookies are invalid or expired (code ${retcode}).${midHint}`,
      retcode
    );
  }

  if (retcode === -10002) {
    throw new HoyolabCheckinError(
      404,
      "No Genshin Impact account is bound to these HoYoLAB cookies (code -10002).",
      retcode
    );
  }

  if (retcode === -110 || retcode === 10101 || retcode === 1028) {
    throw new HoyolabCheckinError(
      429,
      "HoYoLAB rate limit reached. Please wait a minute before checking in again.",
      retcode
    );
  }

  throw new HoyolabCheckinError(
    502,
    `HoYoLAB check-in error (${retcode}): ${message || "Unknown error"}`,
    retcode
  );
}

function resolveTodayReward(
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

async function fetchCheckinSnapshot(auth: HoyolabAuthConfig, lang: string) {
  const [infoRes, homeSettled] = await Promise.all([
    fetchSolApi<SolInfoData>({ endpoint: "info", method: "GET", lang, auth }),
    fetchSolApi<SolHomeData>({
      endpoint: "home",
      method: "GET",
      lang,
      auth,
    }).then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const })
    ),
  ]);

  const infoCode = Number(infoRes.retcode ?? 0);
  throwIfHoyolabFailure(infoCode, infoRes.message, auth);

  const totalSignDays = Number(infoRes.data?.total_sign_day ?? 0);
  const checkedInToday = Boolean(infoRes.data?.is_sign);
  const missedDays = Number(infoRes.data?.sign_cnt_missed ?? 0);

  const utc8Now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  let month = utc8Now.getUTCMonth() + 1;
  let awards: HoyolabCheckinAward[] = [];

  if (homeSettled.ok && Number(homeSettled.value.retcode ?? 0) === 0) {
    const homeData = homeSettled.value.data;
    if (homeData?.month) {
      month = Number(homeData.month);
    }
    if (Array.isArray(homeData?.awards)) {
      awards = homeData.awards.map((award, idx) => ({
        day: idx + 1,
        name: String(award.name ?? `Day ${idx + 1} Reward`),
        count: Number(award.cnt ?? 1),
        iconUrl: award.icon ? String(award.icon) : "",
      }));
    }
  }

  return {
    totalSignDays,
    checkedInToday,
    missedDays,
    month,
    awards,
  };
}

/**
 * Inspects today's Genshin Impact HoYoLAB check-in status and optionally claims
 * the daily reward.
 * - "status": read-only check (/info + /home).
 * - "ensure": checks /info first; claims via /sign only if is_sign is false.
 * - "claim": triggers POST /sign directly (for manual check-in fallback).
 */
export async function runGenshinCheckinAction(
  request: HoyolabCheckinRequest = {}
): Promise<HoyolabCheckinState> {
  const action: HoyolabCheckinAction = request.action ?? "ensure";
  if (action !== "status" && action !== "ensure" && action !== "claim") {
    throw new HoyolabCheckinError(
      400,
      "Invalid check-in action. Expected status, ensure, or claim."
    );
  }

  const auth = resolveHoyolabAuth(request);
  const lang = sanitizeLang(request.lang ?? process.env.HOYOLAB_LANG);
  const utc8Date = getHoyolabUtc8Date();
  const accountTag = auth.accountId ? `ltuid:${auth.accountId}` : "env-or-cookie";

  const snapshot = await fetchCheckinSnapshot(auth, lang);

  if (action === "status") {
    return {
      status: snapshot.checkedInToday ? "already_claimed" : "ready",
      checkedInToday: snapshot.checkedInToday,
      utc8Date,
      month: snapshot.month,
      totalSignDays: snapshot.totalSignDays,
      missedDays: snapshot.missedDays,
      todayReward: resolveTodayReward(
        snapshot.awards,
        snapshot.totalSignDays,
        snapshot.checkedInToday
      ),
      awards: snapshot.awards,
      message: snapshot.checkedInToday
        ? "Already checked in for today."
        : "Today's daily check-in reward is ready to claim.",
      checkedAt: new Date().toISOString(),
      accountTag,
    };
  }

  if (action === "ensure" && snapshot.checkedInToday) {
    return {
      status: "already_claimed",
      checkedInToday: true,
      utc8Date,
      month: snapshot.month,
      totalSignDays: snapshot.totalSignDays,
      missedDays: snapshot.missedDays,
      todayReward: resolveTodayReward(
        snapshot.awards,
        snapshot.totalSignDays,
        true
      ),
      awards: snapshot.awards,
      message: "Already checked in for today.",
      checkedAt: new Date().toISOString(),
      accountTag,
    };
  }

  const signRes = await fetchSolApi<SolSignData>({
    endpoint: "sign",
    method: "POST",
    lang,
    auth,
  });
  const signCode = Number(signRes.retcode ?? 0);

  if (signCode === -5003) {
    return {
      status: "already_claimed",
      checkedInToday: true,
      utc8Date,
      month: snapshot.month,
      totalSignDays: snapshot.totalSignDays,
      missedDays: snapshot.missedDays,
      todayReward: resolveTodayReward(
        snapshot.awards,
        snapshot.totalSignDays,
        true
      ),
      awards: snapshot.awards,
      message: "Already checked in for today.",
      checkedAt: new Date().toISOString(),
      accountTag,
    };
  }

  throwIfHoyolabFailure(signCode, signRes.message, auth);

  const isRiskChallenge =
    Boolean(signRes.data?.is_risk) ||
    Boolean(signRes.data?.gt) ||
    Number(signRes.data?.success ?? 0) === 1;

  if (isRiskChallenge) {
    return {
      status: "risk_challenge",
      checkedInToday: false,
      utc8Date,
      month: snapshot.month,
      totalSignDays: snapshot.totalSignDays,
      missedDays: snapshot.missedDays,
      todayReward: resolveTodayReward(
        snapshot.awards,
        snapshot.totalSignDays,
        false
      ),
      awards: snapshot.awards,
      message:
        "HoYoLAB requested human verification (CAPTCHA). Claim once on act.hoyolab.com, then click Manual Check-In to refresh.",
      checkedAt: new Date().toISOString(),
      accountTag,
    };
  }

  // Refresh /info best-effort so streak count matches HoYoLAB server state
  let finalDays = snapshot.checkedInToday
    ? snapshot.totalSignDays
    : snapshot.totalSignDays + 1;
  let finalMissed = snapshot.missedDays;
  try {
    const refreshed = await fetchSolApi<SolInfoData>({
      endpoint: "info",
      method: "GET",
      lang,
      auth,
    });
    if (Number(refreshed.retcode ?? 0) === 0 && refreshed.data) {
      finalDays = Number(refreshed.data.total_sign_day ?? finalDays);
      finalMissed = Number(refreshed.data.sign_cnt_missed ?? finalMissed);
    }
  } catch {
    // Keep optimistic count when post-sign /info refresh fails transiently
  }

  return {
    status: "claimed",
    checkedInToday: true,
    utc8Date,
    month: snapshot.month,
    totalSignDays: finalDays,
    missedDays: finalMissed,
    todayReward: resolveTodayReward(snapshot.awards, finalDays, true),
    awards: snapshot.awards,
    message: "Successfully checked in for today!",
    checkedAt: new Date().toISOString(),
    accountTag,
  };
}
