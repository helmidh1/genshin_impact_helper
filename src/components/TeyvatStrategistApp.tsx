"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { CoachTab } from "@/components/CoachTab";
import { HoyolabSyncModal } from "@/components/HoyolabSyncModal";
import { OverviewTab } from "@/components/OverviewTab";
import { ShowcaseTab } from "@/components/ShowcaseTab";
import { TopNavBar, type AppTab } from "@/components/TopNavBar";
import { ENCOUNTER_PRESETS } from "@/lib/demo-data";
import { ELEMENT_THEMES } from "@/lib/elements";
import { getHoyolabUtc8Date } from "@/lib/directives-engine";
import {
  getActiveProfile,
  getCoachChat,
  getCoachEngineMode,
  getCoachStrategy,
  getDirectives,
  getParty,
  profileStore,
} from "@/lib/profile-store";
import { useProfileStore } from "@/lib/use-profile-store";
import { useHasMounted } from "@/lib/use-has-mounted";
import type {
  CoachEngineMode,
  CoachFollowUpMessage,
  CoachStrategyResponse,
  DailyDirectives,
  HoyolabCheckinAction,
  HoyolabCheckinState,
  HoyolabCredentialsPayload,
  HoyolabSyncResponse,
  ShowcaseCharacter,
  TravelerProfile,
} from "@/types/genshin";

function hasHoyolabCredValues(creds: HoyolabCredentialsPayload | null): boolean {
  return Boolean(
    creds?.cookieString?.trim() ||
      (creds?.ltuid?.trim() && creds?.ltoken?.trim())
  );
}

async function postHoyolabCheckin(
  action: HoyolabCheckinAction,
  creds: HoyolabCredentialsPayload | null
): Promise<HoyolabCheckinState> {
  const res = await fetch("/api/hoyolab/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(creds ?? {}),
      action,
    }),
  });
  const data = (await res.json()) as HoyolabCheckinState & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to run HoYoLAB daily check-in.");
  }
  return data;
}

function createInitialPreviewStrategy(
  roster: ShowcaseCharacter[]
): CoachStrategyResponse {
  const party = roster.slice(0, 4);
  const names = party.map((c) => c.name).join(" • ") || "Sample Team";
  return {
    teamName: names,
    rotationDuration: "21.0s Cycle",
    estimatedDpsLabel: "Preview (Click Analyze)",
    criticalNote:
      "Click 'Analyze Team & Generate Strategy' on the left to compute a tailored rotation using your active character stats and encounter matchup.",
    rotationSteps: party.map((char, idx) => ({
      step: idx + 1,
      timeRange: `${idx * 3}.0s – ${(idx + 1) * 3}.0s`,
      character: char.name,
      element: char.element,
      action: `${char.name} ${idx === 0 ? "Setup / Carry" : "Skill + Burst"}`,
      notes: `Lv.${char.level} C${char.constellation} • ${char.weapon.name}`,
    })),
    buffBars: party.slice(1).map((c, idx) => ({
      name: `${c.name} Support Buff`,
      duration: "12s",
      color: ELEMENT_THEMES[c.element].hex,
      startPct: 15 + idx * 18,
      widthPct: 36,
    })),
    energyChecks: party.map((c) => ({
      character: c.name,
      element: c.element,
      currentEr: c.stats.er,
      recommendedEr: c.element === "Pyro" && c.name === "Bennett" ? 210 : 160,
      status: c.stats.er >= 150 ? "Optimal" : "Deficit",
      advice:
        c.stats.er >= 150
          ? "Meets typical burst uptime baseline."
          : "Verify Energy Recharge requirements for your exact rotation.",
    })),
    executionCards: [
      {
        title: ENCOUNTER_PRESETS[0].name,
        rule: ENCOUNTER_PRESETS[0].location,
        detail: ENCOUNTER_PRESETS[0].mechanicsAlert,
      },
      {
        title: "Theorycraft Baseline",
        rule: "Local-First + Gemini 3.8 Flash",
        detail:
          "Your synced HoYoLAB builds and party selections are stored locally in your browser and sent only when you request AI coaching.",
      },
    ],
    upgradePriorities: party.map(
      (c) =>
        `${c.name}: ${c.talents.normal}/${c.talents.skill}/${c.talents.burst} • ${c.totalCv.toFixed(1)} CV`
    ),
    source: "fallback",
  };
}

function TeyvatSkeletonShell() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-[#dfe2f1]">
      <header className="w-full sticky top-0 z-40 border-b border-[#d4af37]/20 bg-[#0d121f]/80 backdrop-blur-md">
        <div className="max-w-[1720px] mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 rounded-full bg-[#d4af37]/60" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-white">
                Teyvat Strategist
              </div>
              <div className="text-[10px] font-mono text-[#99907c] tracking-wider">
                COMBAT & ROSTER TELEMETRY
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-8 w-24 rounded-lg bg-[#1a2235]/60 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-[#1a2235]/60 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-[#1a2235]/60 animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-[#1a2235]/60 border border-[#d4af37]/20 animate-pulse" />
        </div>
      </header>

      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <div className="h-28 rounded-xl bg-[#131a2a]/40 border border-[#d4af37]/20 animate-pulse p-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-[#1f293d]" />
            <div className="h-8 w-32 rounded bg-[#1f293d]" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#99907c]">
            <div className="w-2 h-2 rounded-full bg-[#f2ca50] animate-ping" />
            <span>CONNECTING LOCAL TELEMETRY...</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 rounded-xl bg-[#131a2a]/30 border border-white/5 animate-pulse p-4 space-y-4"
            >
              <div className="h-36 rounded-lg bg-[#1f293d]/50" />
              <div className="h-4 w-28 rounded bg-[#1f293d]" />
              <div className="h-3 w-40 rounded bg-[#1f293d]/60" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function TeyvatStrategistApp() {
  const hasMounted = useHasMounted();
  const storeState = useProfileStore();
  const [activeTab, setActiveTab] = useState<AppTab>("overview");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hoyolabModalOpen, setHoyolabModalOpen] = useState(false);
  const [isHoyolabSyncing, setIsHoyolabSyncing] = useState(false);
  const [hoyolabError, setHoyolabError] = useState<string | null>(null);
  const [envHoyolabConfigured, setEnvHoyolabConfigured] = useState(false);
  const [savedHoyolabCreds, setSavedHoyolabCreds] =
    useState<HoyolabCredentialsPayload | null>(null);
  const [isCheckinBusy, setIsCheckinBusy] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  const activeProfile = getActiveProfile(storeState);
  const directives = getDirectives(storeState);
  const partyNames = getParty(storeState);
  const strategy =
    getCoachStrategy(storeState) ??
    createInitialPreviewStrategy(activeProfile.characters);
  const chatMessages = getCoachChat(storeState);
  const coachEngineMode = getCoachEngineMode(storeState);
  const savedProfiles = storeState.profiles;
  const checkinState = storeState.checkinState;

  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(0);

  const effectiveAvatarId =
    activeProfile.characters.some((c) => c.avatarId === selectedAvatarId)
      ? selectedAvatarId
      : (activeProfile.characters[0]?.avatarId ?? 0);

  const runCheckin = async (
    action: HoyolabCheckinAction,
    credsOverride?: HoyolabCredentialsPayload | null
  ) => {
    const credsToUse =
      credsOverride !== undefined ? credsOverride : savedHoyolabCreds;
    setIsCheckinBusy(true);
    setCheckinError(null);
    try {
      const next = await postHoyolabCheckin(action, credsToUse);
      profileStore.saveCheckinState(next);
    } catch (err) {
      setCheckinError(
        err instanceof Error
          ? err.message
          : "Failed to run HoYoLAB daily check-in."
      );
    } finally {
      setIsCheckinBusy(false);
    }
  };

  const handleManualCheckin = () => {
    if (!hasHoyolabCredValues(savedHoyolabCreds) && !envHoyolabConfigured) {
      handleOpenHoyolabModal();
      return;
    }
    void runCheckin("claim");
  };

  const handleRefreshCheckin = () => {
    if (!hasHoyolabCredValues(savedHoyolabCreds) && !envHoyolabConfigured) {
      handleOpenHoyolabModal();
      return;
    }
    void runCheckin("status");
  };

  const runHoyolabSync = async (
    payload: HoyolabCredentialsPayload,
    rememberInBrowser: boolean,
    trigger: "modal" | "refresh" = "modal"
  ) => {
    setIsHoyolabSyncing(true);
    setHoyolabError(null);
    setSyncError(null);
    try {
      const res = await fetch("/api/hoyolab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as HoyolabSyncResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(
          data.error ?? "Failed to sync full roster from HoYoLAB."
        );
      }

      if (
        rememberInBrowser &&
        (payload.cookieString?.trim() ||
          (payload.ltuid?.trim() && payload.ltoken?.trim()))
      ) {
        profileStore.saveHoyolabCredentials(payload);
        setSavedHoyolabCreds(payload);
      }

      profileStore.saveProfile(data.profile);

      if (data.profile.characters.length > 0) {
        const defaultParty = data.profile.characters
          .slice(0, 4)
          .map((c) => c.name);
        const existingParty = profileStore.getParty(data.profile.uid);
        const rosterNames = new Set(
          data.profile.characters.map((c) => c.name)
        );
        const validParty = existingParty.filter((n) => rosterNames.has(n));
        const nextParty = validParty.length >= 2 ? validParty : defaultParty;
        profileStore.setParty(data.profile.uid, nextParty);

        setSelectedAvatarId((prevId) =>
          data.profile.characters.some((c) => c.avatarId === prevId)
            ? prevId
            : data.profile.characters[0].avatarId
        );

        const preview = createInitialPreviewStrategy(data.profile.characters);
        profileStore.saveCoachStrategy(data.profile.uid, preview);
      }

      if (data.liveDirectives) {
        profileStore.updateDirectives(data.profile.uid, {
          ...data.liveDirectives,
          source: "hoyolab",
        });
      }

      if (data.notesError) {
        setSyncError(
          `Full HoYoLAB roster synced, but Real-Time Notes could not be refreshed: ${data.notesError}`
        );
      }

      setHoyolabModalOpen(false);
      if (
        trigger === "modal" ||
        !checkinState?.checkedInToday ||
        checkinState.utc8Date !== getHoyolabUtc8Date()
      ) {
        void runCheckin("ensure", payload);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to sync full roster from HoYoLAB.";
      if (trigger === "modal") {
        setHoyolabError(msg);
      } else {
        setSyncError(msg);
      }
    } finally {
      setIsHoyolabSyncing(false);
    }
  };

  const handleSyncNow = () => {
    const targetUid =
      savedHoyolabCreds?.uid ??
      (activeProfile.source === "hoyolab" ? activeProfile.uid : undefined);

    if (savedHoyolabCreds) {
      void runHoyolabSync(
        { ...savedHoyolabCreds, ...(targetUid ? { uid: targetUid } : {}) },
        true,
        "refresh"
      );
    } else if (envHoyolabConfigured) {
      void runHoyolabSync(
        targetUid ? { uid: targetUid } : {},
        false,
        "refresh"
      );
    } else {
      handleOpenHoyolabModal();
    }
  };

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;
      const loadedCreds = profileStore.loadHoyolabCredentials();
      setSavedHoyolabCreds(loadedCreds);

      const cachedCheckin = profileStore.getState().checkinState;
      if (cachedCheckin && cachedCheckin.utc8Date !== getHoyolabUtc8Date()) {
        profileStore.clearCheckinState();
      }

      const curr = profileStore.getActiveProfile();
      setSelectedAvatarId(curr.characters[0]?.avatarId ?? 0);
    });

    fetch("/api/hoyolab")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then(async (data: { envConfigured?: boolean } | null) => {
        if (!active) return;
        const envConfigured = Boolean(data?.envConfigured);
        setEnvHoyolabConfigured(envConfigured);

        const effectiveCreds = profileStore.loadHoyolabCredentials();
        const credsAvailable =
          hasHoyolabCredValues(effectiveCreds) || envConfigured;

        const currentProfile = profileStore.getActiveProfile();

        if (credsAvailable) {
          const targetUid =
            effectiveCreds?.uid ??
            (currentProfile.source === "hoyolab" ? currentProfile.uid : undefined);

          await runHoyolabSync(
            { ...(effectiveCreds ?? {}), ...(targetUid ? { uid: targetUid } : {}) },
            Boolean(hasHoyolabCredValues(effectiveCreds)),
            "refresh"
          );
        } else if (currentProfile.source === "enka" && currentProfile.uid) {
          try {
            setIsHoyolabSyncing(true);
            const res = await fetch(
              `/api/enka/${encodeURIComponent(currentProfile.uid)}`
            );
            if (res.ok) {
              const refreshed = (await res.json()) as TravelerProfile;
              if (active) {
                profileStore.saveProfile(refreshed);
              }
            }
          } catch {
            // Ignore background refresh error on start
          } finally {
            if (active) {
              setIsHoyolabSyncing(false);
            }
          }
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenHoyolabModal = () => {
    setHoyolabError(null);
    setHoyolabModalOpen(true);
  };

  const handleClearSavedHoyolabCreds = () => {
    profileStore.clearHoyolabCredentials();
    profileStore.clearCheckinState();
    setSavedHoyolabCreds(null);
    setCheckinError(null);
    if (envHoyolabConfigured) {
      void runCheckin("ensure", {});
    }
  };

  const handleSwitchProfile = (uid: string) => {
    profileStore.setActiveUid(uid);
    setSyncError(null);
    const target = profileStore.getActiveProfile();
    setSelectedAvatarId(target.characters[0]?.avatarId ?? 0);
  };

  const handleRemoveProfile = (uid: string) => {
    profileStore.removeProfile(uid);
    const target = profileStore.getActiveProfile();
    setSelectedAvatarId(target.characters[0]?.avatarId ?? 0);
  };

  const handleUpdateDirectives = (next: DailyDirectives) => {
    profileStore.updateDirectives(activeProfile.uid, next);
  };

  const handleChangePartyNames = (names: string[]) => {
    profileStore.setParty(activeProfile.uid, names);
  };

  const handleUpdateStrategy = (next: CoachStrategyResponse) => {
    profileStore.saveCoachStrategy(activeProfile.uid, next);
  };

  const handleUpdateChat = (next: CoachFollowUpMessage[]) => {
    profileStore.setCoachChat(activeProfile.uid, next);
  };

  const handleUpdateEngineMode = (next: CoachEngineMode) => {
    profileStore.setCoachEngineMode(next);
  };

  if (!hasMounted) {
    return <TeyvatSkeletonShell />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSyncData={handleSyncNow}
        onOpenHoyolabSync={handleOpenHoyolabModal}
        isSyncing={isHoyolabSyncing}
        activeProfile={activeProfile}
        savedProfiles={savedProfiles}
        onSwitchProfile={handleSwitchProfile}
        onRemoveProfile={handleRemoveProfile}
      />

      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-4">
        {syncError && (
          <div className="px-4 py-3 rounded-lg bg-red-950/45 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{syncError}</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncError(null)}
              className="text-red-300 hover:text-white font-mono cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <OverviewTab
            profile={activeProfile}
            directives={directives}
            onUpdateDirectives={handleUpdateDirectives}
            onOpenHoyolabSync={handleOpenHoyolabModal}
            onRefreshUid={handleSyncNow}
            isSyncing={isHoyolabSyncing}
            checkinState={checkinState}
            isCheckinBusy={isCheckinBusy}
            checkinError={checkinError}
            hasHoyolabCreds={
              hasHoyolabCredValues(savedHoyolabCreds) || envHoyolabConfigured
            }
            onManualCheckin={handleManualCheckin}
            onRefreshCheckin={handleRefreshCheckin}
            onInspectCharacter={(avatarId) => {
              setSelectedAvatarId(avatarId);
              setActiveTab("showcase");
            }}
            onOpenCoach={() => setActiveTab("coach")}
          />
        )}

        {activeTab === "showcase" && (
          <ShowcaseTab
            characters={activeProfile.characters}
            selectedAvatarId={effectiveAvatarId}
            onSelectAvatar={setSelectedAvatarId}
            onCoachCharacter={(char) => {
              const others = activeProfile.characters
                .filter((c) => c.name !== char.name)
                .slice(0, 3)
                .map((c) => c.name);
              handleChangePartyNames([char.name, ...others]);
              setActiveTab("coach");
            }}
          />
        )}

        {activeTab === "coach" && (
          <CoachTab
            roster={activeProfile.characters}
            partyNames={partyNames}
            onChangePartyNames={handleChangePartyNames}
            strategy={strategy}
            onUpdateStrategy={handleUpdateStrategy}
            chatMessages={chatMessages}
            onUpdateChatMessages={handleUpdateChat}
            engineMode={coachEngineMode}
            onChangeEngineMode={handleUpdateEngineMode}
          />
        )}
      </main>

      <footer className="border-t border-white/8 py-3 px-4 md:px-6 lg:px-8 text-[11px] font-mono text-[#99907c] flex flex-wrap items-center justify-between gap-2 max-w-[1720px] w-full mx-auto">
        <span>
          <strong className="text-[#f2ca50]">Teyvat Strategist</strong> •
          Local-First Genshin Combat &amp; Status Hub
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <span>
            Live Sync: HoYoLAB Battle Chronicle • AI Coach: Gemini 3.8 Flash (@google/genai)
          </span>
          <span>•</span>
          <Link href="/enka" className="text-emerald-400 hover:underline">
            Enka Showcase Lookup
          </Link>
        </span>
      </footer>

      <HoyolabSyncModal
        key={hoyolabModalOpen ? `open-${activeProfile.uid}` : "closed"}
        open={hoyolabModalOpen}
        onClose={() => setHoyolabModalOpen(false)}
        envConfigured={envHoyolabConfigured}
        savedCreds={savedHoyolabCreds}
        defaultUid={activeProfile.source === "hoyolab" ? activeProfile.uid : undefined}
        isSyncing={isHoyolabSyncing}
        error={hoyolabError}
        onSubmit={(payload, remember) =>
          runHoyolabSync(payload, remember, "modal")
        }
        onClearSaved={handleClearSavedHoyolabCreds}
      />
    </div>
  );
}
