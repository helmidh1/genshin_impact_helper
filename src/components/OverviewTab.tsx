"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Crown,
  Download,
  Flame,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { DailyCheckinCard } from "@/components/DailyCheckinCard";
import { CharacterAvatar, ElementBadge } from "@/components/ElementBadge";
import { ELEMENT_THEMES } from "@/lib/elements";
import { calculateResinEta, formatCrystalflyTrapCooldown } from "@/lib/directives-engine";
import type {
  DailyDirectives,
  HoyolabCheckinState,
  ShowcaseCharacter,
  TravelerProfile,
} from "@/types/genshin";

type SortMode = "cv" | "constellation" | "element";
type ElementFilter = "All" | ShowcaseCharacter["element"];

const ELEMENT_FILTERS: ElementFilter[] = [
  "All",
  "Pyro",
  "Hydro",
  "Electro",
  "Cryo",
  "Dendro",
  "Anemo",
  "Geo",
];

interface OverviewTabProps {
  profile: TravelerProfile;
  directives: DailyDirectives;
  onUpdateDirectives?: (next: DailyDirectives) => void;
  onRefreshUid: () => void;
  onOpenHoyolabSync: () => void;
  isSyncing: boolean;
  checkinState: HoyolabCheckinState | null;
  isCheckinBusy: boolean;
  checkinError: string | null;
  hasHoyolabCreds: boolean;
  onManualCheckin: () => void;
  onRefreshCheckin: () => void;
  onInspectCharacter: (avatarId: number) => void;
  onOpenCoach: () => void;
}

export function OverviewTab({
  profile,
  directives,
  onRefreshUid,
  onOpenHoyolabSync,
  isSyncing,
  checkinState,
  isCheckinBusy,
  checkinError,
  hasHoyolabCreds,
  onManualCheckin,
  onRefreshCheckin,
  onInspectCharacter,
  onOpenCoach,
}: OverviewTabProps) {
  const [sortMode, setSortMode] = useState<SortMode>("cv");
  const [searchQuery, setSearchQuery] = useState("");
  const [elementFilter, setElementFilter] = useState<ElementFilter>("All");

  const sortedCharacters = useMemo(() => {
    const list = [...profile.characters];
    if (sortMode === "cv") {
      return list.sort((a, b) => b.totalCv - a.totalCv);
    }
    if (sortMode === "constellation") {
      return list.sort((a, b) => b.constellation - a.constellation || b.totalCv - a.totalCv);
    }
    return list.sort((a, b) => a.element.localeCompare(b.element));
  }, [profile.characters, sortMode]);

  const filteredCharacters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedCharacters.filter((char) => {
      if (elementFilter !== "All" && char.element !== elementFilter) {
        return false;
      }
      if (!q) return true;
      return (
        char.name.toLowerCase().includes(q) ||
        char.weapon.name.toLowerCase().includes(q) ||
        char.artifactSets.some((s) => s.name.toLowerCase().includes(q))
      );
    });
  }, [sortedCharacters, searchQuery, elementFilter]);

  const topBottleneckChar = useMemo(() => {
    return (
      profile.characters.find((c) => c.critique) ??
      profile.characters[0] ??
      null
    );
  }, [profile.characters]);

  const resinEta = calculateResinEta(directives);

  const crystalflyStatus = useMemo(() => {
    if (directives.crystalflyTrapDeployedAt) {
      return formatCrystalflyTrapCooldown(directives.crystalflyTrapDeployedAt);
    }
    const isReady = directives.crystalflyTrapReady ?? true;
    return {
      ready: isReady,
      label:
        directives.crystalflyTrapRecoveryText ??
        (isReady ? "Ready to use" : "On cooldown"),
      remainingMs: 0,
    };
  }, [
    directives.crystalflyTrapDeployedAt,
    directives.crystalflyTrapReady,
    directives.crystalflyTrapRecoveryText,
  ]);

  const handleExportProfile = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teyvat-strategist-${profile.uid}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT 9 COLS */}
      <div className="lg:col-span-9 space-y-6">
        {/* Traveler Status Banner */}
        <section className="glass-panel-gold rounded-xl p-5 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#d4af37]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg bg-[#0a0e18] border-2 border-[#d4af37]/60 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.22)] shrink-0">
                <Crown className="w-8 h-8 text-[#f2ca50]" />
                <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded bg-[#262a35] border border-[#d4af37]/50 text-[10px] font-mono font-bold text-[#f2ca50]">
                  WL {profile.worldLevel}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] tracking-widest font-mono text-[#f2ca50] uppercase font-bold px-2 py-0.5 rounded bg-[#d4af37]/12 border border-[#d4af37]/30">
                    TRAVELER PROFILE / AR {profile.ar}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border ${
                      profile.source === "hoyolab"
                        ? "text-[#f2ca50] bg-[#d4af37]/15 border-[#d4af37]/40"
                        : profile.source === "enka"
                        ? "text-emerald-400 bg-emerald-950/40 border-emerald-500/30"
                        : "text-[#4cd6fb] bg-[#00b4d8]/10 border-[#00b4d8]/30"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        profile.source === "hoyolab"
                          ? "bg-[#f2ca50] animate-pulse"
                          : profile.source === "enka"
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-[#4cd6fb]"
                      }`}
                    />
                    {profile.source === "hoyolab"
                      ? "HoYoLAB Full Roster"
                      : profile.source === "enka"
                      ? profile.cached
                        ? "Enka.Network (TTL Cached)"
                        : "Live Enka.Network"
                      : "Demo Profile (Click Sync Data to connect HoYoLAB)"}
                  </span>
                  {profile.source !== "demo" && (
                    <span className="text-[10px] font-mono text-[#99907c]">
                      Synced{" "}
                      {new Date(profile.syncedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
                  <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#dfe2f1] tracking-tight">
                    {profile.nickname}
                  </h1>
                  {profile.signature && (
                    <span className="text-xs text-[#d0c5af] truncate max-w-md">
                      {profile.signature}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenHoyolabSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded bg-[#262a35] border border-[#d4af37]/45 hover:border-[#f2ca50] text-[#f2ca50] font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Users className="w-3.5 h-3.5" />
                {profile.source === "hoyolab"
                  ? "HoYoLAB Setup"
                  : "Connect HoYoLAB"}
              </button>
              <button
                type="button"
                onClick={onRefreshUid}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded bg-[#1c1f2a] border border-white/12 hover:border-[#d4af37]/50 text-[#dfe2f1] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                />
                Refresh API Data
              </button>
              <button
                type="button"
                onClick={handleExportProfile}
                className="px-3 py-1.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/40 hover:bg-[#d4af37]/25 text-[#f2ca50] font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
            </div>
          </div>

          {profile.warning && (
            <div className="mt-3 px-3 py-2 rounded-md bg-amber-950/35 border border-amber-500/35 text-xs text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{profile.warning}</span>
            </div>
          )}

          {/* 5 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mt-4">
            <div className="bg-[#171b26]/80 border border-white/8 rounded-lg p-3 hover:border-[#d4af37]/40 transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c] mb-1 flex items-center justify-between">
                <span>Adventure Rank</span>
                <Award className="w-3.5 h-3.5 text-[#f2ca50]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#f2ca50] tabular-nums">
                  AR {profile.ar}
                </span>
                {profile.ar >= 60 && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1 rounded">
                    MAX
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-[#d0c5af]/80 mt-1">
                World Level {profile.worldLevel}
              </div>
            </div>

            <div className="bg-[#171b26]/80 border border-white/8 rounded-lg p-3 hover:border-[#d4af37]/40 transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c] mb-1 flex items-center justify-between">
                <span>Spiral Abyss</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#dfe2f1] tabular-nums">
                  {profile.abyssFloor}
                </span>
                <span className="text-[11px] font-mono font-bold text-[#f2ca50] tabular-nums">
                  {profile.abyssStars}★
                </span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Cycle Progress
              </div>
            </div>

            <div className="bg-[#171b26]/80 border border-white/8 rounded-lg p-3 hover:border-[#d4af37]/40 transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c] mb-1 flex items-center justify-between">
                <span>Imaginarium</span>
                <Flame className="w-3.5 h-3.5 text-[#4cd6fb]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#dfe2f1] tabular-nums">
                  {profile.theaterAct}
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#d0c5af] mt-1 tabular-nums">
                {profile.theaterMedals} Starlight Medals
              </div>
            </div>

            <div className="bg-[#171b26]/80 border border-white/8 rounded-lg p-3 hover:border-[#d4af37]/40 transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c] mb-1 flex items-center justify-between">
                <span>Achievements</span>
                <Trophy className="w-3.5 h-3.5 text-[#f2ca50]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#dfe2f1] tabular-nums">
                  {profile.achievements.toLocaleString("en-US")}
                </span>
                <span className="text-[11px] font-mono text-[#99907c]">unlocked</span>
              </div>
              <div className="text-[10px] font-mono text-[#d0c5af]/80 mt-1">
                Total Completed
              </div>
            </div>

            <div className="bg-[#171b26]/80 border border-white/8 rounded-lg p-3 hover:border-[#d4af37]/40 transition-colors col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c] mb-1 flex items-center justify-between">
                <span>
                  {profile.source === "hoyolab"
                    ? "Account Roster"
                    : "Showcase Roster"}
                </span>
                <Users className="w-3.5 h-3.5 text-[#f2ca50]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#dfe2f1] tabular-nums">
                  {profile.characters.length}
                </span>
                {profile.source === "hoyolab" &&
                profile.avatarCount > profile.characters.length ? (
                  <span className="text-[11px] font-mono text-[#d0c5af] tabular-nums">
                    / {profile.avatarCount} Synced
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-[#d0c5af]">
                    Loaded
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-[#f2ca50] mt-1 tabular-nums">
                {profile.lv90Count} Characters at Lv.90
              </div>
            </div>
          </div>
        </section>

        {/* Character Roster / Showcase Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-[#f2ca50] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#dfe2f1] uppercase tracking-wide">
                {profile.source === "hoyolab"
                  ? "Full Account Roster"
                  : "Public Character Showcase"}
              </h2>
              <span className="text-xs font-mono text-[#99907c] px-2 py-0.5 bg-[#262a35] rounded border border-white/10 tabular-nums">
                {filteredCharacters.length === sortedCharacters.length
                  ? `${sortedCharacters.length} Units Loaded`
                  : `${filteredCharacters.length} / ${sortedCharacters.length} Units`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#99907c]">Sort by:</span>
              {(
                [
                  { id: "cv", label: "Crit Value" },
                  { id: "constellation", label: "Constellation" },
                  { id: "element", label: "Element" },
                ] as { id: SortMode; label: string }[]
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSortMode(option.id)}
                  className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                    sortMode === option.id
                      ? "bg-[#262a35] border-[#d4af37]/50 text-[#f2ca50] font-semibold"
                      : "bg-[#1c1f2a] border-white/10 text-[#d0c5af] hover:text-[#dfe2f1]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {sortedCharacters.length > 0 && (
            <div className="glass-panel rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-[#99907c] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by character, weapon, or artifact set..."
                  className="w-full bg-[#0a0e18]/80 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#dfe2f1] placeholder:text-[#99907c]/70 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {ELEMENT_FILTERS.map((el) => {
                  const active = elementFilter === el;
                  return (
                    <button
                      key={el}
                      type="button"
                      onClick={() => setElementFilter(el)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                        active
                          ? "bg-[#262a35] border-[#d4af37]/50 text-[#f2ca50] font-semibold"
                          : "bg-[#0a0e18]/60 border-white/10 text-[#99907c] hover:text-[#dfe2f1]"
                      }`}
                    >
                      {el}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sortedCharacters.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center text-sm text-[#d0c5af]">
              No character builds are loaded for this profile yet. Click{" "}
              <span className="text-[#f2ca50] font-semibold">
                Connect HoYoLAB
              </span>{" "}
              or{" "}
              <span className="text-[#f2ca50] font-semibold">Sync Data</span>{" "}
              in the top bar to import your live Battle Chronicle roster.
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div className="glass-panel rounded-xl p-6 text-center text-xs text-[#d0c5af] space-y-2">
              <p>No characters match your current search or element filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setElementFilter("All");
                }}
                className="px-3 py-1 rounded bg-[#262a35] border border-[#d4af37]/40 text-[#f2ca50] font-mono cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {filteredCharacters.map((char) => (
                <ShowcaseCard
                  key={char.avatarId}
                  char={char}
                  onClick={() => onInspectCharacter(char.avatarId)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* RIGHT 3 COLS */}
      <aside className="lg:col-span-3 space-y-5">
        {/* HoYoLAB Genshin Daily Check-In */}
        <DailyCheckinCard
          checkinState={checkinState}
          isBusy={isCheckinBusy}
          error={checkinError}
          hasHoyolabCreds={hasHoyolabCreds}
          onManualCheckin={onManualCheckin}
          onRefreshStatus={onRefreshCheckin}
          onOpenHoyolabSync={onOpenHoyolabSync}
        />

        {/* Directives & Resin (Non-editable actual sync status) */}
        <div className="glass-panel rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1] uppercase tracking-wider">
                Directives &amp; Resin
              </h3>
              <p className="text-[11px] text-[#99907c]">
                {directives.lastUpdatedAt
                  ? `Synced ${new Date(directives.lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Live progression status"}
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
              {profile.source === "hoyolab" ? "HOYOLAB LIVE" : "LIVE STATUS"}
            </span>
          </div>

          {/* Original Resin */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#d0c5af]">Original Resin</span>
              <span className="font-bold text-[#dfe2f1] tabular-nums">
                {directives.resin} / {directives.maxResin}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#0a0e18] border border-white/8 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00b4d8] to-[#4cd6fb] transition-all"
                style={{
                  width: `${resinEta.percentage}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#99907c]">
              <span>{resinEta.label}</span>
              <span className="text-[10px] text-[#4cd6fb]">
                {resinEta.percentage}%
              </span>
            </div>
          </div>

          {/* Condensed Resin */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0e18]/75 border border-white/8">
            <span className="text-xs font-mono text-[#d0c5af]">
              Condensed Resin
            </span>
            <span className="font-mono text-xs font-bold text-[#f2ca50] tabular-nums">
              {directives.condensedResin} / 5
            </span>
          </div>

          {/* Weekly Bosses & Daily Commissions */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#0a0e18]/75 border border-white/8">
              <div className="text-[10px] text-[#99907c] uppercase">
                Weekly Bosses
              </div>
              <div className="font-bold text-[#dfe2f1] mt-0.5 tabular-nums">
                {directives.weeklyBossDiscountsRemaining !== undefined
                  ? `${directives.weeklyBossDiscountsRemaining} / 3 Discounts Left`
                  : `${directives.weeklyBossesDone} / 3 Discounts`}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0a0e18]/75 border border-white/8">
              <div className="text-[10px] text-[#99907c] uppercase">
                Commissions
              </div>
              <div className="font-bold text-emerald-400 mt-0.5 tabular-nums">
                {directives.dailyCommissionsDone} / {directives.totalCommissions ?? 4} Done
              </div>
            </div>
          </div>

          {/* Serenitea Pot Realm Currency */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0e18]/75 border border-white/8">
            <span className="text-xs font-mono text-[#d0c5af]">
              Realm Currency
            </span>
            <span className="font-mono text-xs font-semibold text-[#dfe2f1] tabular-nums">
              {(directives.realmCurrency ?? 0).toLocaleString("en-US")} / {(directives.maxRealmCurrency ?? 2400).toLocaleString("en-US")}
            </span>
          </div>

          {/* Parametric Transformer */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0e18]/75 border border-white/8">
            <div>
              <div className="text-xs font-medium text-[#dfe2f1]">
                Parametric Transformer
              </div>
              <div className="text-[10px] font-mono text-[#99907c]">
                {directives.parametricReady
                  ? "Ready to use"
                  : directives.parametricRecoveryText ?? "On cooldown"}
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                directives.parametricReady
                  ? "bg-[#d4af37]/20 text-[#f2ca50] border border-[#d4af37]/50"
                  : "bg-[#1c1f2a] text-[#99907c] border border-white/10"
              }`}
            >
              {directives.parametricReady ? "Ready" : "On Cooldown"}
            </span>
          </div>

          {/* Crystalfly Trap */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0e18]/75 border border-white/8">
            <div>
              <div className="text-xs font-medium text-[#dfe2f1]">
                Crystalfly Trap
              </div>
              <div className="text-[10px] font-mono text-[#99907c]">
                {crystalflyStatus.ready
                  ? "Ready to use"
                  : crystalflyStatus.label ?? "On cooldown"}
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                crystalflyStatus.ready
                  ? "bg-[#d4af37]/20 text-[#f2ca50] border border-[#d4af37]/50"
                  : "bg-[#1c1f2a] text-[#99907c] border border-white/10"
              }`}
            >
              {crystalflyStatus.ready ? "Ready" : "On Cooldown"}
            </span>
          </div>
        </div>

        {/* AI Combat & Rotation Coach Launcher */}
        <div className="glass-panel-gold rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f2ca50]" />
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1] uppercase tracking-wider">
                AI Combat Coach
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#4cd6fb]">
              Gemini 3.8
            </span>
          </div>

          {topBottleneckChar?.critique ? (
            <div className="p-3 rounded-lg bg-[#0a0e18]/80 border border-white/8 space-y-1.5 text-xs">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#ff7a5c]">
                Build Bottleneck Detected • {topBottleneckChar.name}
              </div>
              <p className="text-[#d0c5af] leading-relaxed">
                {topBottleneckChar.critique.bottleneck}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#d0c5af] leading-relaxed">
              Import your UID or select 4 characters to generate frame-calibrated
              team rotations, ER funneling checks, and Abyss matchup tactics.
            </p>
          )}

          <button
            type="button"
            onClick={onOpenCoach}
            className="gold-tactical-btn w-full py-2 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            Run Rotation Simulator
          </button>
        </div>
      </aside>
    </div>
  );
}

function ShowcaseCard({
  char,
  onClick,
}: {
  char: ShowcaseCharacter;
  onClick: () => void;
}) {
  const theme = ELEMENT_THEMES[char.element];
  const primarySet = char.artifactSets[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-panel text-left rounded-lg p-3.5 relative overflow-hidden group transition-all hover:-translate-y-0.5 cursor-pointer ${theme.glowShadow}`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${theme.hex}, transparent)`,
        }}
      />

      <div className="flex items-start gap-2.5">
        <CharacterAvatar
          name={char.name}
          element={char.element}
          iconUrl={char.iconUrl}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <ElementBadge element={char.element} compact />
            <span className="text-[11px] font-mono font-bold text-[#f2ca50] bg-[#d4af37]/12 border border-[#d4af37]/40 px-1.5 rounded">
              C{char.constellation}
            </span>
          </div>
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1] truncate mt-1 group-hover:text-[#f2ca50] transition-colors">
            {char.name}
          </h3>
          <div className="text-[11px] font-mono text-[#99907c] tabular-nums">
            Lv. {char.level}/{char.maxLevel} • T {char.talents.normal}/
            {char.talents.skill}/{char.talents.burst}
          </div>
        </div>
      </div>

      {/* Weapon & Artifact Set */}
      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#d0c5af] truncate flex items-center gap-1">
            <Swords className="w-3 h-3 text-[#f2ca50] shrink-0" />
            <span className="truncate">{char.weapon.name}</span>
          </span>
          <span className="text-[10px] font-bold text-[#f2ca50] px-1 rounded bg-[#262a35] border border-[#d4af37]/30 shrink-0">
            R{char.weapon.refinement}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[#99907c] truncate flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#4cd6fb] shrink-0" />
            <span className="truncate">
              {primarySet ? primarySet.name : "Mixed Artifacts"}
            </span>
          </span>
          <span className="text-[10px] text-[#d0c5af] font-semibold shrink-0">
            {primarySet ? `${primarySet.count}pc` : "—"}
          </span>
        </div>
      </div>

      {/* Combat Stats & CV */}
      <div className="mt-3 p-2.5 rounded bg-[#0a0e18]/80 border border-white/8 space-y-1 font-mono text-[11px] tabular-nums">
        <div className="flex justify-between items-center">
          <span className="text-[#99907c]">CRIT Rate / DMG</span>
          <span className="font-bold text-[#dfe2f1]">
            {char.stats.critRate.toFixed(1)}% / {char.stats.critDmg.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#99907c]">
            {char.stats.em >= 400
              ? "Elemental Mastery"
              : char.stats.maxHp >= 30000
                ? "Max HP"
                : "Total ATK"}
          </span>
          <span className="font-semibold text-[#4cd6fb]">
            {char.stats.em >= 400
              ? `${char.stats.em} EM`
              : char.stats.maxHp >= 30000
                ? char.stats.maxHp.toLocaleString("en-US")
                : char.stats.atk.toLocaleString("en-US")}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-white/8">
          <span className="text-[10px] text-[#99907c]">Build Grade</span>
          <span className="text-[10px] font-bold text-[#f2ca50] bg-[#d4af37]/12 px-1.5 py-0.5 rounded border border-[#d4af37]/30">
            {char.buildTier} • {char.totalCv.toFixed(0)} CV
          </span>
        </div>
      </div>
    </button>
  );
}
