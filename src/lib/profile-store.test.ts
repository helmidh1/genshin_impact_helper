import { describe, expect, it, vi } from "vitest";
import { DEFAULT_DIRECTIVES, DEMO_TRAVELER_PROFILE } from "@/lib/demo-data";
import {
  createProfileStore,
  getActiveProfile,
  getCoachChat,
  getCoachEngineMode,
  getCoachStrategy,
  getDirectives,
  getParty,
  getSavedPartySetups,
  SERVER_SNAPSHOT,
} from "@/lib/profile-store";
import { reconcileResin } from "@/lib/directives-engine";
import { MemoryStorageAdapter } from "@/lib/test-fixtures";
import type { DailyDirectives, TravelerProfile } from "@/types/genshin";

describe("ProfileStore - Core State & Profiles", () => {
  it("initializes with demo profile when storage is empty", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const state = store.getState();
    expect(state.version).toBe(2);
    expect(state.activeUid).toBe(DEMO_TRAVELER_PROFILE.uid);
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0].uid).toBe(DEMO_TRAVELER_PROFILE.uid);
  });

  it("notifies subscribers when actions update state", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const subscriber = vi.fn();
    const unsubscribe = store.subscribe(subscriber);

    store.setActiveUid("123456789");
    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(store.getState().activeUid).toBe("123456789");

    unsubscribe();
    store.setActiveUid("987654321");
    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it("saves a profile and caps total profiles at 8", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    for (let i = 1; i <= 10; i++) {
      const mockProfile: TravelerProfile = {
        uid: `90000000${i}`,
        nickname: `Traveler ${i}`,
        signature: "Testing",
        ar: 60,
        worldLevel: 8,
        achievements: 500,
        abyssFloor: "12",
        abyssStars: "36",
        theaterAct: "10",
        theaterMedals: 10,
        avatarCount: 40,
        lv90Count: 20,
        source: "enka",
        syncedAt: new Date().toISOString(),
        characters: DEMO_TRAVELER_PROFILE.characters,
      };
      store.saveProfile(mockProfile);
    }

    const state = store.getState();
    expect(state.profiles.length).toBe(8);
    // Most recent profile is active and first in the list
    expect(state.profiles[0].uid).toBe("9000000010");
    expect(state.activeUid).toBe("9000000010");
  });

  it("removes a profile and falls back to demo if all removed", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const customProfile: TravelerProfile = {
      uid: "800111222",
      nickname: "Custom Traveler",
      signature: "",
      ar: 55,
      worldLevel: 7,
      achievements: 300,
      abyssFloor: "11",
      abyssStars: "27",
      theaterAct: "8",
      theaterMedals: 8,
      avatarCount: 30,
      lv90Count: 10,
      source: "enka",
      syncedAt: new Date().toISOString(),
      characters: DEMO_TRAVELER_PROFILE.characters,
    };
    store.saveProfile(customProfile);
    expect(store.getState().profiles.some((p) => p.uid === "800111222")).toBe(true);

    store.removeProfile("800111222");
    store.removeProfile(DEMO_TRAVELER_PROFILE.uid);

    // Fallback to demo profile when empty
    const state = store.getState();
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0].uid).toBe(DEMO_TRAVELER_PROFILE.uid);
    expect(state.activeUid).toBe(DEMO_TRAVELER_PROFILE.uid);
  });
});

describe("ProfileStore - Intent Actions & Domain State", () => {
  it("manages party roster by UID", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const uid = "998877665";
    store.setParty(uid, ["Mualani", "Xiangling", "Furina", "Xilonen"]);

    expect(store.getState().partyByUid[uid]).toEqual([
      "Mualani",
      "Xiangling",
      "Furina",
      "Xilonen",
    ]);
  });

  it("updates directives for UID and preserves resin fields", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const uid = "998877665";
    store.updateDirectives(uid, {
      resin: 180,
      dailyCommissionsDone: 4,
    });

    const directives = store.getState().directivesByUid[uid];
    expect(directives.resin).toBe(180);
    expect(directives.dailyCommissionsDone).toBe(4);
    expect(directives.maxResin).toBe(200);
  });

  it("appends coach chat messages and enforces 20 message cap", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const uid = "112233445";
    for (let i = 1; i <= 25; i++) {
      store.addCoachChatMessage(uid, {
        id: `msg-${i}`,
        role: i % 2 === 0 ? "coach" : "user",
        text: `Message ${i}`,
        timestamp: new Date().toISOString(),
      });
    }

    const messages = store.getState().coachChatByUid[uid];
    expect(messages).toHaveLength(20);
    // Oldest 5 pruned, earliest surviving message is msg-6, latest is msg-25
    expect(messages[0].id).toBe("msg-6");
    expect(messages[19].id).toBe("msg-25");

    store.clearCoachChat(uid);
    expect(store.getState().coachChatByUid[uid]).toEqual([]);
  });

  it("stores and retrieves equipment advice by character key and fallback name", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const mockAdvice = {
      characterName: "Arlecchino",
      archetypeName: "Pyro Hypercarry",
      summary: "High Crimson Moon Semblance priority",
      weaponAdvice: "Crimson Moon Semblance is BiS",
      artifactAdvice: "Fragment of Harmonic Whimsy",
      statPriorityAdvice: "ATK% Sands / Pyro DMG Goblet / CRIT Circlet",
      comparisonVerdict: "Optimal",
      actionableNextSteps: ["Farm domain"],
      externalReferenceNote: "KQM Guide",
      source: "fallback" as const,
    };

    store.saveEquipmentAdvice(10000096, mockAdvice, "Arlecchino");

    expect(store.getEquipmentAdvice(10000096)).toEqual(mockAdvice);
    expect(store.getEquipmentAdvice("Arlecchino")).toEqual(mockAdvice);
    expect(store.getEquipmentAdvice("NonExistent")).toBeNull();
  });

  it("manages isolated credentials without affecting profile state tree", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    store.saveGeminiApiKey("mock-gemini-api-key-safe-12345");
    expect(store.loadGeminiApiKey()).toBe("mock-gemini-api-key-safe-12345");

    store.saveHoyolabCredentials({
      cookieString: "account_id=123; cookie_token=abc",
    });
    expect(store.loadHoyolabCredentials()?.cookieString).toBe(
      "account_id=123; cookie_token=abc"
    );

    // Profile state tree does not leak credentials
    const stateJson = JSON.stringify(store.getState());
    expect(stateJson.includes("mock-gemini-api-key-safe-12345")).toBe(false);

    store.clearGeminiApiKey();
    expect(store.loadGeminiApiKey()).toBe("");

    store.clearHoyolabCredentials();
    expect(store.loadHoyolabCredentials()).toBeNull();
  });
});

describe("ProfileStore - Resin Calculations & Active Reconciliation", () => {
  it("reconciles resin gained based on 8-minute intervals", () => {
    const startMs = Date.parse("2026-03-01T12:00:00Z");
    const directives: DailyDirectives = {
      ...DEFAULT_DIRECTIVES,
      resin: 100,
      maxResin: 200,
      resinRecoverySeconds: (200 - 100) * 480,
      lastUpdatedAt: new Date(startMs).toISOString(),
    };

    // Exactly 16 minutes later (2 resin intervals)
    const sixteenMinsLaterMs = startMs + 16 * 60 * 1000;
    const reconciled = reconcileResin(directives, sixteenMinsLaterMs);

    expect(reconciled.resin).toBe(102);
    expect(reconciled.resinRecoverySeconds).toBe((200 - 102) * 480);
  });

  it("clamps resin to maxResin when elapsed time exceeds full recovery", () => {
    const startMs = Date.parse("2026-03-01T12:00:00Z");
    const directives: DailyDirectives = {
      ...DEFAULT_DIRECTIVES,
      resin: 195,
      maxResin: 200,
      resinRecoverySeconds: 5 * 480,
      lastUpdatedAt: new Date(startMs).toISOString(),
    };

    // 24 hours later
    const dayLaterMs = startMs + 24 * 60 * 60 * 1000;
    const reconciled = reconcileResin(directives, dayLaterMs);

    expect(reconciled.resin).toBe(200);
    expect(reconciled.resinRecoverySeconds).toBe(0);
  });

  it("store.reconcileResin updates active directives and notifies subscribers", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const startMs = Date.parse("2026-03-01T12:00:00Z");
    const uid = store.getState().activeUid;
    store.updateDirectives(uid, {
      resin: 120,
      maxResin: 200,
      lastUpdatedAt: new Date(startMs).toISOString(),
    });

    const subscriber = vi.fn();
    store.subscribe(subscriber);

    // 24 minutes later = 3 resin gained
    const twentyFourMinsLater = startMs + 24 * 60 * 1000;
    store.reconcileResin(twentyFourMinsLater);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(store.getState().directivesByUid[uid].resin).toBe(123);
  });
});

describe("ProfileStore - Legacy V1 Migration", () => {
  it("migrates legacy v1 keys to unified v2 state non-destructively", () => {
    const adapter = new MemoryStorageAdapter();

    const legacyProfile = {
      uid: "888888888",
      nickname: "Legacy Traveler",
      signature: "From v1",
      ar: 60,
      worldLevel: 8,
      achievements: 800,
      abyssFloor: "12",
      abyssStars: "36",
      theaterAct: "10",
      theaterMedals: 10,
      avatarCount: 40,
      lv90Count: 20,
      source: "enka" as const,
      syncedAt: "2026-01-01T00:00:00Z",
      characters: DEMO_TRAVELER_PROFILE.characters,
    };

    adapter.setItem("teyvat_strategist_profiles_v1", JSON.stringify([legacyProfile]));
    adapter.setItem("teyvat_strategist_active_uid_v1", JSON.stringify("888888888"));
    adapter.setItem(
      "teyvat_strategist_party_by_uid_v1",
      JSON.stringify({ "888888888": ["Navia", "Chiori", "Zhongli", "Bennett"] })
    );
    adapter.setItem(
      "teyvat_strategist_directives_by_uid_v1",
      JSON.stringify({
        "888888888": {
          resin: 140,
          maxResin: 200,
          resinRecoverySeconds: 60 * 480,
          dailyCommissionsDone: 4,
          weeklyBossesDone: 1,
          realmCurrency: 1200,
          realmCurrencyMax: 2400,
          lastUpdatedAt: "2026-01-01T00:00:00Z",
        },
      })
    );

    const store = createProfileStore(adapter);
    const state = store.getState();

    expect(state.version).toBe(2);
    expect(state.activeUid).toBe("888888888");
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0].uid).toBe("888888888");
    expect(state.partyByUid["888888888"]).toEqual([
      "Navia",
      "Chiori",
      "Zhongli",
      "Bennett",
    ]);
    expect(state.directivesByUid["888888888"].resin).toBe(200); // 140 resin capped to 200 over elapsed months

    // Verify V2 was written to storage
    const v2Raw = adapter.getItem("teyvat_strategist_store_v2");
    expect(v2Raw).not.toBeNull();
    const v2Parsed = JSON.parse(v2Raw!);
    expect(v2Parsed.version).toBe(2);
    expect(v2Parsed.activeUid).toBe("888888888");
  });

  it("provides convenient active profile, directives, and party query helpers", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    const activeProfile = store.getActiveProfile();
    expect(activeProfile.uid).toBe(DEMO_TRAVELER_PROFILE.uid);

    const directives = store.getDirectives();
    expect(directives.maxResin).toBe(200);

    const party = store.getParty();
    expect(party.length).toBeGreaterThanOrEqual(1);
  });

  it("exports a frozen SERVER_SNAPSHOT matching initial default state", () => {
    expect(SERVER_SNAPSHOT).toBeDefined();
    expect(SERVER_SNAPSHOT.version).toBe(2);
    expect(SERVER_SNAPSHOT.activeUid).toBe(DEMO_TRAVELER_PROFILE.uid);
    expect(SERVER_SNAPSHOT.profiles[0].uid).toBe(DEMO_TRAVELER_PROFILE.uid);
    expect(Object.isFrozen(SERVER_SNAPSHOT)).toBe(true);
  });

  it("pure query functions evaluate correctly on ProfileState without store instance", () => {
    const active = getActiveProfile(SERVER_SNAPSHOT);
    expect(active.uid).toBe(DEMO_TRAVELER_PROFILE.uid);
    expect(active.nickname).toBe(DEMO_TRAVELER_PROFILE.nickname);

    const directives = getDirectives(SERVER_SNAPSHOT);
    expect(directives.resin).toBe(DEFAULT_DIRECTIVES.resin);

    const party = getParty(SERVER_SNAPSHOT);
    expect(party.length).toBe(4);
    expect(party[0]).toBe(DEMO_TRAVELER_PROFILE.characters[0].name);

    const strategy = getCoachStrategy(SERVER_SNAPSHOT);
    expect(strategy).toBeNull();

    const chat = getCoachChat(SERVER_SNAPSHOT);
    expect(chat).toEqual([]);

    const engineMode = getCoachEngineMode(SERVER_SNAPSHOT);
    expect(engineMode).toBe("gemini");
  });

  it("manages and persists coachEngineMode updates", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);

    expect(store.getCoachEngineMode()).toBe("gemini");

    store.setCoachEngineMode("heuristic");
    expect(store.getCoachEngineMode()).toBe("heuristic");
    expect(store.getState().coachEngineMode).toBe("heuristic");

    // Fresh store instance with same storage retains the setting
    const reloaded = createProfileStore(adapter);
    expect(reloaded.getCoachEngineMode()).toBe("heuristic");
  });

  it("saves, retrieves, and removes preconfigured party setups by UID", () => {
    const adapter = new MemoryStorageAdapter();
    const store = createProfileStore(adapter);
    const uid = DEMO_TRAVELER_PROFILE.uid;

    expect(store.getSavedPartySetups(uid)).toEqual([]);

    const saved = store.savePartySetup(uid, "Rational Core", [
      "Raiden Shogun",
      "Xiangling",
      "Xingqiu",
      "Bennett",
    ]);

    expect(saved.id).toBeDefined();
    expect(saved.name).toBe("Rational Core");
    expect(saved.characterNames).toHaveLength(4);

    expect(store.getSavedPartySetups(uid)).toHaveLength(1);
    expect(store.getSavedPartySetups(uid)[0].name).toBe("Rational Core");

    // Pure query helper on state
    expect(getSavedPartySetups(store.getState(), uid)).toHaveLength(1);

    // Persistence across store instances
    const reloaded = createProfileStore(adapter);
    expect(reloaded.getSavedPartySetups(uid)).toHaveLength(1);

    // Removal
    store.removeSavedPartySetup(uid, saved.id);
    expect(store.getSavedPartySetups(uid)).toHaveLength(0);
  });
});
