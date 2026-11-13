"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { CoachTab } from "@/components/CoachTab";
import { HoyolabSyncModal } from "@/components/HoyolabSyncModal";
import { OverviewTab } from "@/components/OverviewTab";
import { ShowcaseTab } from "@/components/ShowcaseTab";
import { TopNavBar, type AppTab } from "@/components/TopNavBar";
import {
  DEFAULT_DIRECTIVES,
  DEMO_TRAVELER_PROFILE,
  ENCOUNTER_PRESETS,
} from "@/lib/demo-data";
import { ELEMENT_THEMES } from "@/lib/elements";
import {
  clearCheckinState,
  clearHoyolabCredentials,
  getHoyolabUtc8Date,
  loadActiveUid,
  loadCoachChat,
  loadDirectives,
  loadSavedCheckinState,
  loadSavedCoachStrategy,
  loadSavedHoyolabCredentials,
  loadSavedPartyNames,
  loadSavedProfiles,
  reconcileResinDirectives,
  removeProfile,
  saveActiveUid,
  saveCheckinState,
  saveCoachChat,
  saveCoachStrategy,
  saveDirectives,
  saveHoyolabCredentials,
  savePartyNames,
  saveProfile,
} from "@/lib/storage";
import type {
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

export function TeyvatStrategistApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("overview");
  const [savedProfiles, setSavedProfiles] = useState<TravelerProfile[]>([
    DEMO_TRAVELER_PROFILE,
  ]);
  const [activeUid, setActiveUid] = useState<string>(DEMO_TRAVELER_PROFILE.uid);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hoyolabModalOpen, setHoyolabModalOpen] = useState(false);
  const [isHoyolabSyncing, setIsHoyolabSyncing] = useState(false);
  const [hoyolabError, setHoyolabError] = useState<string | null>(null);
  const [envHoyolabConfigured, setEnvHoyolabConfigured] = useState(false);
  const [savedHoyolabCreds, setSavedHoyolabCreds] =
    useState<HoyolabCredentialsPayload | null>(null);
  const [checkinState, setCheckinState] =
    useState<HoyolabCheckinState | null>(null);
  const [isCheckinBusy, setIsCheckinBusy] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [directives, setDirectives] =
    useState<DailyDirectives>(DEFAULT_DIRECTIVES);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(
    DEMO_TRAVELER_PROFILE.characters[0]?.avatarId ?? 0
  );
  const [partyNames, setPartyNames] = useState<string[]>(
    DEMO_TRAVELER_PROFILE.characters.slice(0, 4).map((c) => c.name)
  );
  const [strategy, setStrategy] = useState<CoachStrategyResponse>(() =>
    createInitialPreviewStrategy(DEMO_TRAVELER_PROFILE.characters)
  );
  const [chatMessages, setChatMessages] = useState<CoachFollowUpMessage[]>([]);

  const activeProfile =
    savedProfiles.find((p) => p.uid === activeUid) ??
    savedProfiles[0] ??
    DEMO_TRAVELER_PROFILE;

  const syncProfileContext = (profile: TravelerProfile) => {
    const defaultParty = profile.characters.slice(0, 4).map((c) => c.name);
    setSelectedAvatarId(profile.characters[0]?.avatarId ?? 0);
    setPartyNames(loadSavedPartyNames(profile.uid, defaultParty));
    setDirectives(loadDirectives(profile.uid));
    const savedStrategy = loadSavedCoachStrategy(profile.uid);
    setStrategy(savedStrategy ?? createInitialPreviewStrategy(profile.characters));
    setChatMessages(loadCoachChat(profile.uid));
  };

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
      setCheckinState(next);
      saveCheckinState(next);
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
        saveHoyolabCredentials(payload);
        setSavedHoyolabCreds(payload);
      }

      const nextProfiles = saveProfile(data.profile);
      setSavedProfiles(nextProfiles);
      setActiveUid(data.profile.uid);

      if (data.profile.characters.length > 0) {
        const defaultParty = data.profile.characters
          .slice(0, 4)
          .map((c) => c.name);
        const existingParty = loadSavedPartyNames(
          data.profile.uid,
          defaultParty
        );
        const rosterNames = new Set(
          data.profile.characters.map((c) => c.name)
        );
        const validParty = existingParty.filter((n) => rosterNames.has(n));
        const nextParty = validParty.length >= 2 ? validParty : defaultParty;
        setPartyNames(nextParty);
        savePartyNames(data.profile.uid, nextParty);

        setSelectedAvatarId((prevId) =>
          data.profile.characters.some((c) => c.avatarId === prevId)
            ? prevId
            : data.profile.characters[0].avatarId
        );

        const preview = createInitialPreviewStrategy(data.profile.characters);
        setStrategy(preview);
        saveCoachStrategy(data.profile.uid, preview);
      } else {
        syncProfileContext(data.profile);
      }

      if (data.liveDirectives) {
        setDirectives((prev) => {
          const merged: DailyDirectives = {
            ...prev,
            ...data.liveDirectives,
            source: "hoyolab",
            lastUpdatedAt: new Date().toISOString(),
          };
          saveDirectives(merged, false, data.profile.uid);
          return merged;
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
    let loadedCreds: HoyolabCredentialsPayload | null = null;
    let cachedCheckin: HoyolabCheckinState | null = null;

    Promise.resolve().then(() => {
      if (!active) return;
      const profiles = loadSavedProfiles();
      const uid = loadActiveUid();
      const current =
        profiles.find((p) => p.uid === uid) ??
        profiles[0] ??
        DEMO_TRAVELER_PROFILE;
      const defaultParty = current.characters.slice(0, 4).map((c) => c.name);
      setSavedProfiles(profiles);
      setActiveUid(current.uid);
      setDirectives(loadDirectives(current.uid));

      loadedCreds = loadSavedHoyolabCredentials();
      setSavedHoyolabCreds(loadedCreds);

      cachedCheckin = loadSavedCheckinState();
      if (cachedCheckin && cachedCheckin.utc8Date === getHoyolabUtc8Date()) {
        setCheckinState(cachedCheckin);
      }

      setPartyNames(loadSavedPartyNames(current.uid, defaultParty));
      setSelectedAvatarId(current.characters[0]?.avatarId ?? 0);

      const savedStrategy = loadSavedCoachStrategy(current.uid);
      if (savedStrategy) {
        setStrategy(savedStrategy);
      } else {
        setStrategy(createInitialPreviewStrategy(current.characters));
      }
      setChatMessages(loadCoachChat(current.uid));
    });

    fetch("/api/hoyolab")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then(async (data: { envConfigured?: boolean } | null) => {
        if (!active) return;
        const envConfigured = Boolean(data?.envConfigured);
        setEnvHoyolabConfigured(envConfigured);

        const effectiveCreds = loadedCreds ?? loadSavedHoyolabCredentials();
        const credsAvailable =
          hasHoyolabCredValues(effectiveCreds) || envConfigured;

        const profiles = loadSavedProfiles();
        const activeUidVal = loadActiveUid();
        const currentProfile =
          profiles.find((p) => p.uid === activeUidVal) ??
          profiles[0] ??
          DEMO_TRAVELER_PROFILE;

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
                const nextProfiles = saveProfile(refreshed);
                setSavedProfiles(nextProfiles);
                syncProfileContext(refreshed);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setDirectives((prev) => {
        const next = reconcileResinDirectives(prev);
        if (next.resin !== prev.resin) {
          saveDirectives(next, true);
        }
        return next;
      });
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenHoyolabModal = () => {
    setHoyolabError(null);
    setHoyolabModalOpen(true);
  };

  const handleClearSavedHoyolabCreds = () => {
    clearHoyolabCredentials();
    clearCheckinState();
    setSavedHoyolabCreds(null);
    setCheckinError(null);
    if (envHoyolabConfigured) {
      void runCheckin("ensure", {});
    } else {
      setCheckinState(null);
    }
  };

  const handleSwitchProfile = (uid: string) => {
    const found = savedProfiles.find((p) => p.uid === uid);
    if (!found) return;
    setActiveUid(uid);
    saveActiveUid(uid);
    setSyncError(null);
    syncProfileContext(found);
  };

  const handleRemoveProfile = (uid: string) => {
    const next = removeProfile(uid);
    setSavedProfiles(next);
    const nextActive = next[0];
    setActiveUid(nextActive.uid);
    syncProfileContext(nextActive);
  };

  const handleUpdateDirectives = (next: DailyDirectives) => {
    const resinChanged = next.resin !== directives.resin;
    const stamped = {
      ...next,
      lastUpdatedAt: resinChanged
        ? new Date().toISOString()
        : next.lastUpdatedAt,
    };
    setDirectives(stamped);
    saveDirectives(stamped, !resinChanged);
  };

  const handleChangePartyNames = (names: string[]) => {
    setPartyNames(names);
    savePartyNames(activeProfile.uid, names);
  };

  const handleUpdateStrategy = (next: CoachStrategyResponse) => {
    setStrategy(next);
    saveCoachStrategy(activeProfile.uid, next);
  };

  const handleUpdateChat = (next: CoachFollowUpMessage[]) => {
    setChatMessages(next);
    saveCoachChat(activeProfile.uid, next);
  };

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
            selectedAvatarId={selectedAvatarId}
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
