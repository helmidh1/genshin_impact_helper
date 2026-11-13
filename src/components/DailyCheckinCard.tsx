"use client";

import { useState } from "react";
import {
  AlertCircle,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Gift,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import type { HoyolabCheckinState } from "@/types/genshin";

const HOYOLAB_GENSHIN_CHECKIN_PAGE =
  "https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481";

interface DailyCheckinCardProps {
  checkinState: HoyolabCheckinState | null;
  isBusy: boolean;
  error: string | null;
  hasHoyolabCreds: boolean;
  onManualCheckin: () => void;
  onRefreshStatus: () => void;
  onOpenHoyolabSync: () => void;
}

function RewardIcon({
  iconUrl,
  name,
  className = "w-6 h-6",
}: {
  iconUrl?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!iconUrl || failed) {
    return <Gift className="w-4 h-4 text-[#f2ca50]" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt={name}
      className={`${className} object-contain`}
      onError={() => setFailed(true)}
    />
  );
}

export function DailyCheckinCard({
  checkinState,
  isBusy,
  error,
  hasHoyolabCreds,
  onManualCheckin,
  onRefreshStatus,
  onOpenHoyolabSync,
}: DailyCheckinCardProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const badge = (() => {
    if (!hasHoyolabCreds && !checkinState) {
      return {
        label: "NOT LINKED",
        cls: "bg-[#1c1f2a] border-white/15 text-[#99907c]",
      };
    }
    if (isBusy && !checkinState) {
      return {
        label: "CHECKING",
        cls: "bg-[#00b4d8]/15 border-[#4cd6fb]/35 text-[#4cd6fb]",
      };
    }
    if (checkinState?.checkedInToday) {
      return {
        label: "CLAIMED TODAY",
        cls: "bg-emerald-950/45 border-emerald-500/35 text-emerald-400",
      };
    }
    if (checkinState?.status === "risk_challenge") {
      return {
        label: "CAPTCHA",
        cls: "bg-amber-950/45 border-amber-500/40 text-amber-300",
      };
    }
    if (checkinState) {
      return {
        label: "READY",
        cls: "bg-[#d4af37]/15 border-[#d4af37]/45 text-[#f2ca50]",
      };
    }
    return {
      label: "PENDING",
      cls: "bg-[#1c1f2a] border-white/15 text-[#d0c5af]",
    };
  })();

  return (
    <div className="glass-panel rounded-xl p-4 space-y-3.5">
      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#f2ca50] shrink-0">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1] uppercase tracking-wider truncate">
              Daily Check-In
            </h3>
            <p className="text-[11px] text-[#99907c] truncate">
              HoYoLAB • Genshin Impact
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.cls}`}
          >
            {badge.label}
          </span>
          {(hasHoyolabCreds || checkinState) && (
            <button
              type="button"
              onClick={onRefreshStatus}
              disabled={isBusy}
              title="Refresh today's HoYoLAB check-in status"
              className="p-1 rounded bg-[#1c1f2a] border border-white/10 hover:border-[#d4af37]/40 text-[#d0c5af] hover:text-[#f2ca50] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3 h-3 ${isBusy ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {!hasHoyolabCreds && !checkinState ? (
        <div className="space-y-3">
          <p className="text-xs text-[#d0c5af] leading-relaxed">
            Connect your HoYoLAB cookies to automatically verify today&apos;s
            Genshin check-in, claim unclaimed rewards, and browse the monthly
            calendar.
          </p>
          <button
            type="button"
            onClick={onOpenHoyolabSync}
            className="gold-tactical-btn w-full py-2 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Connect HoYoLAB
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {checkinState && (
            <>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#99907c] tabular-nums">
                <span>
                  Month {checkinState.month} •{" "}
                  <strong className="text-[#dfe2f1]">
                    Day {checkinState.totalSignDays}
                    {checkinState.awards.length > 0
                      ? ` / ${checkinState.awards.length}`
                      : ""}
                  </strong>
                </span>
                {checkinState.missedDays > 0 && (
                  <span className="text-[#d0c5af]/80">
                    {checkinState.missedDays} missed
                  </span>
                )}
              </div>

              {checkinState.todayReward && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0a0e18]/80 border border-white/8">
                  <div className="w-9 h-9 rounded-md bg-[#131a2a] border border-[#d4af37]/35 flex items-center justify-center shrink-0">
                    <RewardIcon
                      key={checkinState.todayReward.iconUrl}
                      iconUrl={checkinState.todayReward.iconUrl}
                      name={checkinState.todayReward.name}
                      className="w-7 h-7"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c]">
                      {checkinState.checkedInToday
                        ? "Claimed Today"
                        : "Today's Reward"}
                    </div>
                    <div className="text-xs font-semibold text-[#dfe2f1] truncate">
                      {checkinState.todayReward.name}{" "}
                      <span className="font-mono text-[#f2ca50] tabular-nums">
                        ×{checkinState.todayReward.count.toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>
                  {checkinState.checkedInToday && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
              )}

              <p className="text-[11px] text-[#d0c5af] leading-snug">
                {checkinState.message}
              </p>

              {checkinState.status === "risk_challenge" && (
                <a
                  href={HOYOLAB_GENSHIN_CHECKIN_PAGE}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#4cd6fb] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open HoYoLAB Check-In Page
                </a>
              )}
            </>
          )}

          {!checkinState && isBusy && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#4cd6fb] py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Checking today&apos;s HoYoLAB check-in status...</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/45 border border-red-500/35 text-[11px] text-red-200 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{error}</p>
                {error.toLowerCase().includes("cookie") && (
                  <button
                    type="button"
                    onClick={onOpenHoyolabSync}
                    className="text-[#f2ca50] font-mono underline cursor-pointer"
                  >
                    Update HoYoLAB Cookies
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onManualCheckin}
            disabled={isBusy}
            title={
              checkinState?.checkedInToday
                ? "Run manual HoYoLAB check-in just in case"
                : "Claim today's HoYoLAB Genshin daily reward"
            }
            className={
              checkinState?.checkedInToday
                ? "w-full py-1.5 px-3 rounded bg-[#1c1f2a] border border-[#d4af37]/35 hover:border-[#f2ca50] text-[#f2ca50] font-mono text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-55"
                : "gold-tactical-btn w-full py-2 px-3 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
            }
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isBusy ? "animate-spin" : ""}`}
            />
            {isBusy
              ? "Checking In..."
              : checkinState?.checkedInToday
                ? "Manual Check-In"
                : "Check In Now"}
          </button>

          {checkinState && checkinState.awards.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={() => setCalendarOpen((v) => !v)}
                aria-expanded={calendarOpen}
                className="w-full flex items-center justify-between text-[11px] font-mono text-[#d0c5af] hover:text-[#f2ca50] cursor-pointer"
              >
                <span>
                  Monthly Reward Calendar ({checkinState.totalSignDays}/
                  {checkinState.awards.length})
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    calendarOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {calendarOpen && (
                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 p-2 rounded-lg bg-[#0a0e18]/75 border border-white/8">
                  {checkinState.awards.map((award) => {
                    const isClaimed = award.day <= checkinState.totalSignDays;
                    const isClaimedToday =
                      checkinState.checkedInToday &&
                      award.day === checkinState.totalSignDays;
                    const isNextToday =
                      !checkinState.checkedInToday &&
                      award.day === checkinState.totalSignDays + 1;

                    return (
                      <div
                        key={award.day}
                        title={`Day ${award.day}: ${award.name} ×${award.count}`}
                        className={`relative rounded p-1 border flex flex-col items-center justify-between gap-0.5 text-center ${
                          isClaimedToday
                            ? "bg-emerald-950/50 border-emerald-400/75 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                            : isClaimed
                              ? "bg-emerald-950/25 border-emerald-500/30 opacity-85"
                              : isNextToday
                                ? "bg-[#d4af37]/15 border-[#f2ca50] shadow-[0_0_8px_rgba(242,202,80,0.22)]"
                                : "bg-[#131a2a]/85 border-white/8 opacity-75"
                        }`}
                      >
                        <div className="w-full flex items-center justify-between text-[9px] font-mono leading-none">
                          <span
                            className={
                              isNextToday
                                ? "text-[#f2ca50] font-bold"
                                : isClaimedToday
                                  ? "text-emerald-300 font-bold"
                                  : "text-[#99907c]"
                            }
                          >
                            D{award.day}
                          </span>
                          {isClaimed && (
                            <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center my-0.5">
                          <RewardIcon
                            key={award.iconUrl}
                            iconUrl={award.iconUrl}
                            name={award.name}
                            className="w-6 h-6"
                          />
                        </div>
                        <span className="text-[9px] font-mono text-[#dfe2f1] tabular-nums leading-none truncate w-full">
                          ×{award.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
