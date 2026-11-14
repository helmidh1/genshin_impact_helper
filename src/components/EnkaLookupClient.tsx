"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  Crown,
  Download,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { ShowcaseTab } from "@/components/ShowcaseTab";
import { profileStore } from "@/lib/profile-store";
import { useProfileStore } from "@/lib/use-profile-store";
import { useHasMounted } from "@/lib/use-has-mounted";
import type { TravelerProfile } from "@/types/genshin";

export function EnkaLookupClient() {
  const hasMounted = useHasMounted();
  const { profiles } = useProfileStore();
  const savedEnkaProfiles = hasMounted
    ? profiles.filter((p) => p.source === "enka")
    : [];

  const [uidInput, setUidInput] = useState("");
  const [queriedProfile, setQueriedProfile] = useState<TravelerProfile | null>(null);
  const profile = queriedProfile ?? savedEnkaProfiles[0] ?? null;

  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const fetchUid = async (uid: string) => {
    const cleanUid = uid.trim();
    if (!cleanUid) return;
    setIsLoading(true);
    setError(null);
    setSavedToast(false);
    try {
      const res = await fetch(`/api/enka/${encodeURIComponent(cleanUid)}`);
      const data = (await res.json()) as TravelerProfile & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to fetch Enka.Network showcase.");
      }
      setQueriedProfile(data);
      setSelectedAvatarId(data.characters[0]?.avatarId ?? 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch Enka.Network data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchUid(uidInput);
  };

  const handleSaveToHub = () => {
    if (!profile) return;
    profileStore.saveProfile(profile);
    setSavedToast(true);
  };

  const handleExportJson = () => {
    if (!profile) return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `teyvat_enka_uid_${profile.uid}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 h-14 border-b border-white/10 bg-[#131a2a]/85 backdrop-blur-md">
        <div className="max-w-[1720px] h-full mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1c1f2a] border border-white/10 hover:border-[#d4af37]/50 text-xs font-mono text-[#dfe2f1] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#f2ca50]" />
              <span>HoYoLAB Hub</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#262a35] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-base font-bold tracking-tight text-[#dfe2f1] uppercase leading-none">
                  Enka Showcase Lookup
                </div>
                <div className="font-mono text-[10px] tracking-widest text-[#99907c] uppercase mt-0.5">
                  Public 9/10-Digit UID Inspector
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 ml-auto"
          >
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={uidInput}
                onChange={(e) => setUidInput(e.target.value)}
                placeholder="Enter UID (e.g. 600000001)"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-[#0a0e18] border border-white/12 text-xs font-mono text-[#dfe2f1] placeholder:text-[#99907c]/70 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 tabular-nums"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !uidInput.trim()}
              className="gold-tactical-btn cursor-pointer disabled:opacity-50 px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wide flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>{isLoading ? "Loading" : "Lookup UID"}</span>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <div className="px-4 py-3 rounded-lg bg-[#171b26]/90 border border-white/10 text-xs text-[#d0c5af] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Enka.Network inspects{" "}
              <strong className="text-[#dfe2f1]">public in-game showcase</strong>{" "}
              characters for any UID without cookies. For your full account roster
              and live Resin, return to the{" "}
              <Link href="/" className="text-[#f2ca50] underline">
                HoYoLAB Hub
              </Link>
              .
            </span>
          </div>

          {savedEnkaProfiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#99907c] uppercase">
                Saved:
              </span>
              {savedEnkaProfiles.map((p) => (
                <button
                  key={p.uid}
                  type="button"
                  onClick={() => {
                    setQueriedProfile(p);
                    setSelectedAvatarId(p.characters[0]?.avatarId ?? 0);
                    setError(null);
                    setSavedToast(false);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                    profile?.uid === p.uid
                      ? "bg-[#262a35] border-[#d4af37]/60 text-[#f2ca50]"
                      : "bg-[#0a0e18] border-white/10 text-[#d0c5af] hover:border-white/25"
                  }`}
                >
                  {p.nickname} ({p.uid})
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-950/45 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-300 hover:text-white font-mono cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {!profile ? (
          <section className="glass-panel rounded-xl p-10 text-center space-y-3 max-w-2xl mx-auto">
            <Crown className="w-9 h-9 text-[#f2ca50] mx-auto" />
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#dfe2f1]">
              Inspect Any Public UID Showcase
            </h1>
            <p className="text-xs text-[#d0c5af] leading-relaxed">
              Enter a 9- or 10-digit Genshin Impact UID in the bar above to
              inspect showcased characters, Crit Value, substat roll tiers, and
              talent levels via Enka.Network.
            </p>
          </section>
        ) : (
          <>
            <section className="glass-panel-gold rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-lg bg-[#0a0e18] border-2 border-emerald-500/50 flex items-center justify-center shrink-0">
                  <Crown className="w-7 h-7 text-[#f2ca50]" />
                  <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded bg-[#262a35] border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                    WL {profile.worldLevel}
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#dfe2f1]">
                      UID {profile.uid} • AR {profile.ar}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border text-emerald-400 bg-emerald-950/40 border-emerald-500/30">
                      {profile.cached
                        ? "Enka.Network (TTL Cached)"
                        : "Live Enka.Network"}
                    </span>
                    <span className="text-[10px] font-mono text-[#99907c]">
                      Abyss {profile.abyssFloor} ({profile.abyssStars}) •{" "}
                      {profile.characters.length} Showcased
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3 mt-1">
                    <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#dfe2f1]">
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
                  onClick={() => void fetchUid(profile.uid)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded bg-[#1c1f2a] border border-white/12 hover:border-[#d4af37]/50 text-[#dfe2f1] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh UID
                </button>
                <button
                  type="button"
                  onClick={handleSaveToHub}
                  className="px-3 py-1.5 rounded bg-[#262a35] border border-[#d4af37]/45 hover:border-[#f2ca50] text-[#f2ca50] font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {savedToast ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Saved to Main Hub
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Save to Main Hub
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3 py-1.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/40 hover:bg-[#d4af37]/25 text-[#f2ca50] font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
              </div>
            </section>

            {profile.warning && (
              <div className="px-4 py-3 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs text-[#f2ca50]">
                {profile.warning}
              </div>
            )}

            <ShowcaseTab
              characters={profile.characters}
              selectedAvatarId={selectedAvatarId}
              onSelectAvatar={setSelectedAvatarId}
            />
          </>
        )}
      </main>
    </div>
  );
}
