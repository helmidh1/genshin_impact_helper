import { describe, expect, it } from "vitest";
import {
  CRYSTALFLY_TRAP_DURATION_MS,
  calculateResinEta,
  classifyCheckinRetcode,
  formatCrystalflyTrapCooldown,
  formatParametricCooldown,
  getHoyolabUtc8Date,
  reconcileResin,
  resolveTodayReward,
} from "./directives-engine";
import { createMockDirectives } from "@/lib/test-fixtures";
import type { HoyolabCheckinAward } from "@/types/genshin";

describe("DirectivesEngine: Monotonic Resin Recovery", () => {
  it("leaves resin unchanged when zero time has elapsed", () => {
    const base = createMockDirectives({ resin: 120, maxResin: 200 });
    const result = reconcileResin(base, Date.parse("2026-03-01T12:00:00Z"));

    expect(result.resin).toBe(120);
    expect(result.maxResin).toBe(200);
    expect(result.resinRecoverySeconds).toBe(38400); // 80 points * 480s
  });

  it("adds exactly 1 resin after 8 minutes (480,000 ms)", () => {
    const base = createMockDirectives({ resin: 120 });
    const startMs = Date.parse("2026-03-01T12:00:00Z");
    const result = reconcileResin(base, startMs + 480_000);

    expect(result.resin).toBe(121);
    expect(result.resinRecoverySeconds).toBe(37920); // 79 points * 480s
  });

  it("handles cycle remainder progress and projects accurate recovery seconds", () => {
    const base = createMockDirectives({ resin: 120 });
    const startMs = Date.parse("2026-03-01T12:00:00Z");
    // 20 minutes elapsed = 2 full cycles (16 mins) + 4 mins into current cycle
    const result = reconcileResin(base, startMs + 20 * 60 * 1000);

    expect(result.resin).toBe(122);
    // 78 points remaining to cap: 77 * 480 + 240s (4 mins remaining in current cycle) = 37200s
    expect(result.resinRecoverySeconds).toBe(37200);
  });

  it("caps resin cleanly at maxResin and zeroes recovery seconds", () => {
    const base = createMockDirectives({ resin: 198, maxResin: 200 });
    const startMs = Date.parse("2026-03-01T12:00:00Z");
    // 24 hours later
    const result = reconcileResin(base, startMs + 24 * 60 * 60 * 1000);

    expect(result.resin).toBe(200);
    expect(result.resinRecoverySeconds).toBe(0);
  });

  it("preserves already-capped resin without clock regressions", () => {
    const base = createMockDirectives({ resin: 200, maxResin: 200, resinRecoverySeconds: 0 });
    const startMs = Date.parse("2026-03-01T12:00:00Z");
    const result = reconcileResin(base, startMs + 3600_000);

    expect(result.resin).toBe(200);
    expect(result.resinRecoverySeconds).toBe(0);
  });
});

describe("DirectivesEngine: Resin ETA Calculations", () => {
  it("returns fully replenished status when resin equals maxResin", () => {
    const directives = createMockDirectives({ resin: 200, maxResin: 200 });
    const eta = calculateResinEta(directives);

    expect(eta.isCapped).toBe(true);
    expect(eta.remainingMinutes).toBe(0);
    expect(eta.hours).toBe(0);
    expect(eta.minutes).toBe(0);
    expect(eta.percentage).toBe(100);
    expect(eta.label).toBe("Fully Replenished (Capped)");
  });

  it("calculates hours and minutes accurately for partial resin", () => {
    // 40 resin missing * 8 mins = 320 mins = 5h 20m
    const directives = createMockDirectives({ resin: 160, maxResin: 200 });
    const eta = calculateResinEta(directives);

    expect(eta.isCapped).toBe(false);
    expect(eta.remainingMinutes).toBe(320);
    expect(eta.hours).toBe(5);
    expect(eta.minutes).toBe(20);
    expect(eta.percentage).toBe(80);
    expect(eta.label).toBe("Full in ~5h 20m");
  });

  it("calculates accurately from empty resin (0/200)", () => {
    // 200 resin missing * 8 mins = 1600 mins = 26h 40m
    const directives = createMockDirectives({ resin: 0, maxResin: 200 });
    const eta = calculateResinEta(directives);

    expect(eta.isCapped).toBe(false);
    expect(eta.remainingMinutes).toBe(1600);
    expect(eta.hours).toBe(26);
    expect(eta.minutes).toBe(40);
    expect(eta.percentage).toBe(0);
    expect(eta.label).toBe("Full in ~26h 40m");
  });
});

describe("DirectivesEngine: Parametric Transformer Formatting", () => {
  it("formats unlocked and ready states", () => {
    expect(formatParametricCooldown({ obtained: true, reached: true })).toEqual({
      ready: true,
      label: "Ready to use",
    });

    expect(formatParametricCooldown({ obtained: false })).toEqual({
      ready: false,
      label: "Not unlocked",
    });
  });

  it("formats days and hours cooldowns", () => {
    expect(formatParametricCooldown({ obtained: true, reached: false, days: 3, hours: 4 })).toEqual({
      ready: false,
      label: "3d 4h cooldown",
    });

    expect(formatParametricCooldown({ obtained: true, reached: false, days: 0, hours: 5, minutes: 30 })).toEqual({
      ready: false,
      label: "5h 30m cooldown",
    });

    expect(formatParametricCooldown({ obtained: true, reached: false })).toEqual({
      ready: false,
      label: "Cooldown active",
    });
  });
});

describe("DirectivesEngine: Crystalfly Trap Formatting", () => {
  it("returns ready to deploy when no deployment timestamp is present", () => {
    expect(formatCrystalflyTrapCooldown(null)).toEqual({
      ready: true,
      label: "Ready to deploy",
      remainingMs: 0,
    });
    expect(formatCrystalflyTrapCooldown(undefined)).toEqual({
      ready: true,
      label: "Ready to deploy",
      remainingMs: 0,
    });
    expect(formatCrystalflyTrapCooldown("invalid-date")).toEqual({
      ready: true,
      label: "Ready to deploy",
      remainingMs: 0,
    });
  });

  it("formats immediate 7d cooldown upon deployment", () => {
    const now = new Date("2026-03-01T12:00:00Z");
    const result = formatCrystalflyTrapCooldown(now.toISOString(), now);
    expect(result.ready).toBe(false);
    expect(result.label).toBe("7d 0h cooldown");
    expect(result.remainingMs).toBe(CRYSTALFLY_TRAP_DURATION_MS);
  });

  it("calculates remaining days and hours accurately", () => {
    const deployed = new Date("2026-03-01T12:00:00Z");
    // 2 days and 4 hours elapsed -> 4 days and 20 hours remaining
    const now = new Date(deployed.getTime() + (2 * 24 + 4) * 60 * 60 * 1000);
    const result = formatCrystalflyTrapCooldown(deployed.toISOString(), now);

    expect(result.ready).toBe(false);
    expect(result.label).toBe("4d 20h cooldown");
  });

  it("calculates remaining hours and minutes under 24 hours", () => {
    const deployed = new Date("2026-03-01T12:00:00Z");
    // 6 days and 20 hours elapsed -> 4 hours remaining
    const now = new Date(deployed.getTime() + (6 * 24 + 20) * 60 * 60 * 1000);
    const result = formatCrystalflyTrapCooldown(deployed.toISOString(), now);

    expect(result.ready).toBe(false);
    expect(result.label).toBe("4h 0m cooldown");
  });

  it("calculates remaining minutes under 1 hour", () => {
    const deployed = new Date("2026-03-01T12:00:00Z");
    // 6 days, 23 hours, 20 minutes elapsed -> 40 minutes remaining
    const now = new Date(deployed.getTime() + (6 * 24 * 60 + 23 * 60 + 20) * 60 * 1000);
    const result = formatCrystalflyTrapCooldown(deployed.toISOString(), now);

    expect(result.ready).toBe(false);
    expect(result.label).toBe("40m cooldown");
  });

  it("returns ready to collect when full 7 days have elapsed", () => {
    const deployed = new Date("2026-03-01T12:00:00Z");
    const now = new Date(deployed.getTime() + CRYSTALFLY_TRAP_DURATION_MS);
    const result = formatCrystalflyTrapCooldown(deployed.toISOString(), now);

    expect(result.ready).toBe(true);
    expect(result.label).toBe("Ready to collect (15 Cores)");
    expect(result.remainingMs).toBe(0);
  });

  it("returns ready to collect when more than 7 days have elapsed", () => {
    const deployed = new Date("2026-03-01T12:00:00Z");
    const now = new Date(deployed.getTime() + CRYSTALFLY_TRAP_DURATION_MS + 3600_000);
    const result = formatCrystalflyTrapCooldown(deployed.toISOString(), now);

    expect(result.ready).toBe(true);
    expect(result.label).toBe("Ready to collect (15 Cores)");
    expect(result.remainingMs).toBe(0);
  });
});

describe("DirectivesEngine: UTC+8 Date Calculations", () => {
  it("handles UTC to UTC+8 offset correctly across midnight boundaries", () => {
    // 2026-03-01 15:59:00 UTC -> 2026-03-01 23:59:00 UTC+8
    const beforeMidnightUtc = new Date("2026-03-01T15:59:00Z");
    expect(getHoyolabUtc8Date(beforeMidnightUtc)).toBe("2026-03-01");

    // 2026-03-01 16:01:00 UTC -> 2026-03-02 00:01:00 UTC+8
    const afterMidnightUtc = new Date("2026-03-01T16:01:00Z");
    expect(getHoyolabUtc8Date(afterMidnightUtc)).toBe("2026-03-02");
  });
});

describe("DirectivesEngine: HoYoLAB Check-in Domain Heuristics", () => {
  const mockAwards: HoyolabCheckinAward[] = [
    { day: 1, name: "Primogems x20", count: 20, iconUrl: "https://example.com/primo.png" },
    { day: 2, name: "Hero's Wit x3", count: 3, iconUrl: "https://example.com/wit.png" },
    { day: 3, name: "Mora x20000", count: 20000, iconUrl: "https://example.com/mora.png" },
    { day: 4, name: "Mystic Enhancement Ore x3", count: 3, iconUrl: "https://example.com/ore.png" },
  ];

  it("resolves today's reward correctly when already checked in vs when pending", () => {
    // If already checked in on day 2, today's reward was award[1] (Day 2 reward)
    const claimedReward = resolveTodayReward(mockAwards, 2, true);
    expect(claimedReward?.name).toBe("Hero's Wit x3");

    // If pending check-in with 2 days completed, upcoming reward is award[2] (Day 3 reward)
    const pendingReward = resolveTodayReward(mockAwards, 2, false);
    expect(pendingReward?.name).toBe("Mora x20000");

    // Empty awards array returns undefined
    expect(resolveTodayReward([], 1, true)).toBeUndefined();
  });

  it("classifies HoYoLAB check-in retcodes into domain states", () => {
    expect(classifyCheckinRetcode(0)).toEqual({
      status: "success",
      isRiskChallenge: false,
      retcode: 0,
    });

    expect(classifyCheckinRetcode(-5003)).toEqual({
      status: "already_claimed",
      isRiskChallenge: false,
      retcode: -5003,
      message: "Already checked in for today.",
    });

    expect(classifyCheckinRetcode(1034)).toEqual({
      status: "risk_challenge",
      isRiskChallenge: true,
      retcode: 1034,
      message:
        "HoYoLAB requested human verification (CAPTCHA). Claim once on act.hoyolab.com, then click Manual Check-In to refresh.",
    });

    expect(classifyCheckinRetcode(-100)).toEqual({
      status: "auth_expired",
      isRiskChallenge: false,
      retcode: -100,
      message: "HoYoLAB session cookies are invalid or expired (code -100).",
    });

    expect(classifyCheckinRetcode(-10002)).toEqual({
      status: "not_found",
      isRiskChallenge: false,
      retcode: -10002,
      message: "No Genshin Impact account is bound to these HoYoLAB cookies (code -10002).",
    });

    expect(classifyCheckinRetcode(-110)).toEqual({
      status: "rate_limited",
      isRiskChallenge: false,
      retcode: -110,
      message: "HoYoLAB rate limit reached. Please wait a minute before checking in again.",
    });
  });
});
