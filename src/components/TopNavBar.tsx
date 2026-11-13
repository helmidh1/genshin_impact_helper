"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  RefreshCw,
  Sparkles,
  Swords,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { TravelerProfile } from "@/types/genshin";

export type AppTab = "overview" | "showcase" | "coach";

interface TopNavBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onSyncData: () => void;
  onOpenHoyolabSync: () => void;
  isSyncing: boolean;
  activeProfile: TravelerProfile;
  savedProfiles: TravelerProfile[];
  onSwitchProfile: (uid: string) => void;
  onRemoveProfile: (uid: string) => void;
}

export function TopNavBar({
  activeTab,
  onSelectTab,
  onSyncData,
  onOpenHoyolabSync,
  isSyncing,
  activeProfile,
  savedProfiles,
  onSwitchProfile,
  onRemoveProfile,
}: TopNavBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "showcase",
      label: "Character Showcase",
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: "coach",
      label: "Combat & Rotation Coach",
      icon: <Swords className="w-4 h-4" />,
    },
  ];

  return (
    <header className="w-full sticky top-0 z-50 h-14 border-b border-white/10 bg-[#131a2a]/85 backdrop-blur-md">
      <div className="max-w-[1720px] h-full mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand & Nav Tabs */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            type="button"
            onClick={() => onSelectTab("overview")}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#262a35] border border-[#d4af37]/45 flex items-center justify-center text-[#f2ca50] shadow-[0_0_12px_rgba(212,175,55,0.2)] group-hover:border-[#f2ca50] transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-[family-name:var(--font-space-grotesk)] text-base font-bold tracking-tight text-[#f2ca50] uppercase leading-none">
                Teyvat Strategist
              </div>
              <div className="font-mono text-[10px] tracking-widest text-[#99907c] uppercase mt-0.5">
                Combat &amp; Status Hub
              </div>
            </div>
          </button>

          <nav className="flex items-center gap-2 sm:gap-5">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 pb-1.5 pt-1 text-sm font-[family-name:var(--font-space-grotesk)] font-medium border-b-2 transition-colors cursor-pointer ${
                    active
                      ? "text-[#f2ca50] border-[#f2ca50]"
                      : "text-[#d0c5af]/80 border-transparent hover:text-[#dfe2f1]"
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* HoYoLAB Sync Controls + Enka Link + Saved Profile Switcher */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onSyncData}
            disabled={isSyncing}
            title="Sync full roster & live Real-Time Notes from HoYoLAB"
            className="gold-tactical-btn cursor-pointer disabled:opacity-60 px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wide flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span>{isSyncing ? "Syncing" : "Sync Data"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenHoyolabSync}
            disabled={isSyncing}
            title="Configure HoYoLAB cookies or .env.local credentials"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1c1f2a] border border-[#d4af37]/35 hover:border-[#d4af37]/70 hover:bg-[#262a35] text-[#f2ca50] text-xs font-mono font-semibold transition-colors cursor-pointer disabled:opacity-60 shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">HoYoLAB Setup</span>
          </button>

          <Link
            href="/enka"
            title="Open separate Enka.Network Public UID Showcase Lookup"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1c1f2a] border border-white/10 hover:border-emerald-400/50 text-[#d0c5af] hover:text-emerald-300 text-xs font-mono transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Enka Lookup</span>
          </Link>

          {/* Saved UIDs Dropdown */}
          <div className="relative pl-2 border-l border-white/10">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1c1f2a] border border-white/10 hover:border-[#d4af37]/40 transition-colors cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activeProfile.source === "hoyolab"
                    ? "bg-[#f2ca50]"
                    : activeProfile.source === "enka"
                    ? "bg-emerald-400"
                    : "bg-[#4cd6fb]"
                }`}
              />
              <div className="text-left hidden md:block">
                <div className="text-[11px] font-mono font-semibold text-[#dfe2f1] leading-tight max-w-[110px] truncate">
                  {activeProfile.nickname}
                </div>
                <div className="text-[9px] font-mono text-[#f2ca50] tracking-wider tabular-nums">
                  UID {activeProfile.uid}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#99907c]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-[#131a2a] border border-[#d4af37]/35 shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#99907c] flex items-center justify-between">
                  <span>Saved Local Profiles</span>
                  <span>{savedProfiles.length}</span>
                </div>
                <div className="mt-1 space-y-1 max-h-64 overflow-y-auto">
                  {savedProfiles.map((profile) => {
                    const isActive = profile.uid === activeProfile.uid;
                    return (
                      <div
                        key={profile.uid}
                        className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md border ${
                          isActive
                            ? "bg-[#d4af37]/12 border-[#d4af37]/40"
                            : "bg-[#0a0e18]/70 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchProfile(profile.uid);
                            setDropdownOpen(false);
                          }}
                          className="flex-1 text-left cursor-pointer"
                        >
                          <div className="text-xs font-semibold text-[#dfe2f1] flex items-center gap-1.5">
                            <span>{profile.nickname}</span>
                            <span
                              className={`text-[10px] font-mono px-1 rounded ${
                                profile.source === "hoyolab"
                                  ? "bg-[#d4af37]/15 text-[#f2ca50]"
                                  : profile.source === "enka"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-white/5 text-[#99907c]"
                              }`}
                            >
                              {profile.source === "hoyolab"
                                ? "HOYOLAB"
                                : profile.source === "enka"
                                ? "ENKA"
                                : "DEMO"}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-[#d0c5af] tabular-nums">
                            UID {profile.uid} • AR {profile.ar}
                          </div>
                        </button>
                        {savedProfiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onRemoveProfile(profile.uid)}
                            title="Remove saved profile"
                            className="p-1 rounded text-[#99907c] hover:text-[#ff5a36] hover:bg-white/5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
