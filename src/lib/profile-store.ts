import { reconcileResin } from "@/lib/directives-engine";
import { DEFAULT_DIRECTIVES, DEMO_TRAVELER_PROFILE } from "@/lib/demo-data";
import type {
  CoachEngineMode,
  CoachFollowUpMessage,
  CoachStrategyResponse,
  DailyDirectives,
  EquipmentCoachQueryResponse,
  HoyolabCheckinState,
  HoyolabCredentialsPayload,
  ProfileState,
  TravelerProfile,
} from "@/types/genshin";

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY_V2 = "teyvat_strategist_store_v2";
const HOYOLAB_CREDS_KEY = "teyvat_strategist_hoyolab_creds_v1";
const GEMINI_API_KEY_KEY = "teyvat_strategist_gemini_key_v1";
const MAX_PROFILES = 8;
const MAX_CHAT_MESSAGES = 20;

export class BrowserLocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Gracefully handle storage quota or privacy mode errors
    }
  }

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
  }
}

export function createDefaultState(): ProfileState {
  return {
    version: 2,
    activeUid: DEMO_TRAVELER_PROFILE.uid,
    profiles: [DEMO_TRAVELER_PROFILE],
    directivesByUid: {
      [DEMO_TRAVELER_PROFILE.uid]: DEFAULT_DIRECTIVES,
    },
    partyByUid: {
      [DEMO_TRAVELER_PROFILE.uid]: DEMO_TRAVELER_PROFILE.characters
        .slice(0, 4)
        .map((c) => c.name),
    },
    coachStrategyByUid: {},
    coachChatByUid: {},
    coachEngineMode: "gemini",
    checkinState: null,
    equipmentAdviceByChar: {},
  };
}

export const SERVER_SNAPSHOT: ProfileState = Object.freeze(createDefaultState());

export class ProfileStore {
  private state: ProfileState;
  private listeners = new Set<() => void>();
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter = new BrowserLocalStorageAdapter()) {
    this.adapter = adapter;
    this.state = this.loadState();
  }

  private loadState(): ProfileState {
    const raw = this.adapter.getItem(STORAGE_KEY_V2);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ProfileState;
        if (parsed && parsed.version === 2 && Array.isArray(parsed.profiles)) {
          return {
            ...createDefaultState(),
            ...parsed,
            profiles: parsed.profiles.length > 0 ? parsed.profiles : [DEMO_TRAVELER_PROFILE],
          };
        }
      } catch {
        // Fall back to migration/default on parse error
      }
    }

    const migrated = this.migrateV1();
    if (migrated) {
      return migrated;
    }

    return createDefaultState();
  }

  private migrateV1(): ProfileState | null {
    const rawProfiles = this.adapter.getItem("teyvat_strategist_profiles_v1");
    const rawActiveUid = this.adapter.getItem("teyvat_strategist_active_uid_v1");
    const rawParties = this.adapter.getItem("teyvat_strategist_party_by_uid_v1");
    const rawDirectives = this.adapter.getItem("teyvat_strategist_directives_by_uid_v1");
    const rawGlobalDirectives = this.adapter.getItem("teyvat_strategist_directives_v1");
    const rawStrategy = this.adapter.getItem("teyvat_strategist_coach_strategy_by_uid_v1");
    const rawChat = this.adapter.getItem("teyvat_strategist_coach_chat_by_uid_v1");
    const rawCheckin = this.adapter.getItem("teyvat_strategist_hoyolab_checkin_v1");
    const rawAdvice = this.adapter.getItem("teyvat_strategist_equipment_advice_v1");

    if (
      !rawProfiles &&
      !rawActiveUid &&
      !rawParties &&
      !rawDirectives &&
      !rawGlobalDirectives
    ) {
      return null;
    }

    const defaultState = createDefaultState();

    let profiles = defaultState.profiles;
    if (rawProfiles) {
      try {
        const parsed = JSON.parse(rawProfiles) as TravelerProfile[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          profiles = parsed;
        }
      } catch {}
    }

    let activeUid = profiles[0]?.uid ?? defaultState.activeUid;
    if (rawActiveUid) {
      try {
        const parsedUid = JSON.parse(rawActiveUid);
        if (typeof parsedUid === "string" && parsedUid.trim()) {
          activeUid = parsedUid.trim();
        }
      } catch {}
    }

    const directivesByUid: Record<string, DailyDirectives> = {};
    if (rawDirectives) {
      try {
        const parsed = JSON.parse(rawDirectives) as Record<string, DailyDirectives>;
        if (parsed && typeof parsed === "object") {
          for (const [uid, dir] of Object.entries(parsed)) {
            directivesByUid[uid] = reconcileResin(dir);
          }
        }
      } catch {}
    } else if (rawGlobalDirectives) {
      try {
        const parsed = JSON.parse(rawGlobalDirectives) as DailyDirectives;
        if (parsed) {
          directivesByUid[activeUid] = reconcileResin(parsed);
        }
      } catch {}
    }

    let partyByUid: Record<string, string[]> = defaultState.partyByUid;
    if (rawParties) {
      try {
        const parsed = JSON.parse(rawParties) as Record<string, string[]>;
        if (parsed && typeof parsed === "object") {
          partyByUid = { ...partyByUid, ...parsed };
        }
      } catch {}
    }

    let coachStrategyByUid: Record<string, CoachStrategyResponse | null> = {};
    if (rawStrategy) {
      try {
        coachStrategyByUid = JSON.parse(rawStrategy);
      } catch {}
    }

    let coachChatByUid: Record<string, CoachFollowUpMessage[]> = {};
    if (rawChat) {
      try {
        coachChatByUid = JSON.parse(rawChat);
      } catch {}
    }

    let checkinState: HoyolabCheckinState | null = null;
    if (rawCheckin) {
      try {
        checkinState = JSON.parse(rawCheckin);
      } catch {}
    }

    let equipmentAdviceByChar: Record<string, EquipmentCoachQueryResponse> = {};
    if (rawAdvice) {
      try {
        equipmentAdviceByChar = JSON.parse(rawAdvice);
      } catch {}
    }

    const migrated: ProfileState = {
      version: 2,
      activeUid,
      profiles,
      directivesByUid,
      partyByUid,
      coachStrategyByUid,
      coachChatByUid,
      checkinState,
      equipmentAdviceByChar,
    };

    // Non-destructively write V2 state
    this.adapter.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
    return migrated;
  }

  private persist(): void {
    this.adapter.setItem(STORAGE_KEY_V2, JSON.stringify(this.state));
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error("ProfileStore subscriber error:", err);
      }
    }
  }

  getState(): ProfileState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setActiveUid(uid: string): void {
    if (this.state.activeUid === uid) return;
    this.state = {
      ...this.state,
      activeUid: uid,
    };
    this.persist();
    this.notify();
  }

  saveProfile(profile: TravelerProfile): void {
    const existing = this.state.profiles.filter((p) => p.uid !== profile.uid);
    const updatedProfiles = [profile, ...existing].slice(0, MAX_PROFILES);

    this.state = {
      ...this.state,
      profiles: updatedProfiles,
      activeUid: profile.uid,
    };
    this.persist();
    this.notify();
  }

  removeProfile(uid: string): void {
    const remaining = this.state.profiles.filter((p) => p.uid !== uid);
    const nextProfiles = remaining.length > 0 ? remaining : [DEMO_TRAVELER_PROFILE];
    const nextActiveUid =
      this.state.activeUid === uid ? nextProfiles[0].uid : this.state.activeUid;

    this.state = {
      ...this.state,
      profiles: nextProfiles,
      activeUid: nextActiveUid,
    };
    this.persist();
    this.notify();
  }

  setParty(uid: string, partyNames: string[]): void {
    this.state = {
      ...this.state,
      partyByUid: {
        ...this.state.partyByUid,
        [uid]: partyNames,
      },
    };
    this.persist();
    this.notify();
  }

  updateDirectives(uid: string, partial: Partial<DailyDirectives>): void {
    const existing =
      this.state.directivesByUid[uid] ?? DEFAULT_DIRECTIVES;
    const isResinUpdated =
      partial.resin !== undefined && partial.resin !== existing.resin;
    const updated: DailyDirectives = {
      ...existing,
      ...partial,
      maxResin: partial.maxResin ?? existing.maxResin ?? 200,
      lastUpdatedAt:
        partial.lastUpdatedAt ??
        (isResinUpdated
          ? new Date().toISOString()
          : (existing.lastUpdatedAt ?? new Date().toISOString())),
    };

    this.state = {
      ...this.state,
      directivesByUid: {
        ...this.state.directivesByUid,
        [uid]: updated,
      },
    };
    this.persist();
    this.notify();
  }

  saveCoachStrategy(
    uid: string,
    strategy: CoachStrategyResponse | null
  ): void {
    this.state = {
      ...this.state,
      coachStrategyByUid: {
        ...this.state.coachStrategyByUid,
        [uid]: strategy,
      },
    };
    this.persist();
    this.notify();
  }

  addCoachChatMessage(uid: string, message: CoachFollowUpMessage): void {
    const existing = this.state.coachChatByUid[uid] ?? [];
    const updated = [...existing, message].slice(-MAX_CHAT_MESSAGES);

    this.state = {
      ...this.state,
      coachChatByUid: {
        ...this.state.coachChatByUid,
        [uid]: updated,
      },
    };
    this.persist();
    this.notify();
  }

  setCoachChat(uid: string, messages: CoachFollowUpMessage[]): void {
    this.state = {
      ...this.state,
      coachChatByUid: {
        ...this.state.coachChatByUid,
        [uid]: messages.slice(-MAX_CHAT_MESSAGES),
      },
    };
    this.persist();
    this.notify();
  }

  clearCoachChat(uid: string): void {
    this.state = {
      ...this.state,
      coachChatByUid: {
        ...this.state.coachChatByUid,
        [uid]: [],
      },
    };
    this.persist();
    this.notify();
  }

  saveCheckinState(state: HoyolabCheckinState): void {
    this.state = {
      ...this.state,
      checkinState: state,
    };
    this.persist();
    this.notify();
  }

  clearCheckinState(): void {
    this.state = {
      ...this.state,
      checkinState: null,
    };
    this.persist();
    this.notify();
  }

  reconcileResin(nowMs = Date.now()): void {
    const activeUid = this.state.activeUid;
    const current = this.state.directivesByUid[activeUid] ?? DEFAULT_DIRECTIVES;
    const reconciled = reconcileResin(current, nowMs);

    if (
      reconciled.resin !== current.resin ||
      reconciled.resinRecoverySeconds !== current.resinRecoverySeconds
    ) {
      this.state = {
        ...this.state,
        directivesByUid: {
          ...this.state.directivesByUid,
          [activeUid]: reconciled,
        },
      };
      if (reconciled.resin !== current.resin) {
        this.persist();
      }
      this.notify();
    }
  }

  saveEquipmentAdvice(
    characterKey: string | number,
    advice: EquipmentCoachQueryResponse,
    fallbackName?: string
  ): void {
    const next = {
      ...this.state.equipmentAdviceByChar,
      [String(characterKey)]: advice,
    };
    if (fallbackName) {
      next[fallbackName] = advice;
    }

    this.state = {
      ...this.state,
      equipmentAdviceByChar: next,
    };
    this.persist();
    this.notify();
  }

  getEquipmentAdvice(
    characterKey: string | number,
    fallbackKey?: string | number
  ): EquipmentCoachQueryResponse | null {
    const primary = this.state.equipmentAdviceByChar[String(characterKey)];
    if (primary) return primary;
    if (fallbackKey) {
      return this.state.equipmentAdviceByChar[String(fallbackKey)] ?? null;
    }
    return null;
  }

  // Isolated credential slots
  saveGeminiApiKey(apiKey: string): void {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      this.clearGeminiApiKey();
      return;
    }
    this.adapter.setItem(GEMINI_API_KEY_KEY, trimmed);
  }

  loadGeminiApiKey(): string {
    return this.adapter.getItem(GEMINI_API_KEY_KEY) ?? "";
  }

  clearGeminiApiKey(): void {
    this.adapter.removeItem(GEMINI_API_KEY_KEY);
  }

  saveHoyolabCredentials(creds: HoyolabCredentialsPayload): void {
    this.adapter.setItem(HOYOLAB_CREDS_KEY, JSON.stringify(creds));
  }

  loadHoyolabCredentials(): HoyolabCredentialsPayload | null {
    const raw = this.adapter.getItem(HOYOLAB_CREDS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as HoyolabCredentialsPayload;
    } catch {
      return null;
    }
  }

  clearHoyolabCredentials(): void {
    this.adapter.removeItem(HOYOLAB_CREDS_KEY);
  }

  // Domain Queries (delegating to pure functions)
  getActiveProfile(): TravelerProfile {
    return getActiveProfile(this.state);
  }

  getDirectives(uid?: string): DailyDirectives {
    return getDirectives(this.state, uid);
  }

  getParty(uid?: string): string[] {
    return getParty(this.state, uid);
  }

  getCoachStrategy(uid?: string): CoachStrategyResponse | null {
    return getCoachStrategy(this.state, uid);
  }

  getCoachChat(uid?: string): CoachFollowUpMessage[] {
    return getCoachChat(this.state, uid);
  }

  setCoachEngineMode(mode: CoachEngineMode): void {
    this.state = {
      ...this.state,
      coachEngineMode: mode,
    };
    this.persist();
    this.notify();
  }

  getCoachEngineMode(): CoachEngineMode {
    return getCoachEngineMode(this.state);
  }
}

// Pure Domain Queries on ProfileState (safe for SSR, hydration snapshots, and React components)
export function getActiveProfile(state: ProfileState): TravelerProfile {
  return (
    state.profiles.find((p) => p.uid === state.activeUid) ??
    state.profiles[0] ??
    DEMO_TRAVELER_PROFILE
  );
}

export function getDirectives(
  state: ProfileState,
  uid?: string
): DailyDirectives {
  const targetUid = uid ?? state.activeUid;
  return state.directivesByUid[targetUid] ?? DEFAULT_DIRECTIVES;
}

export function getParty(state: ProfileState, uid?: string): string[] {
  const targetUid = uid ?? state.activeUid;
  const existing = state.partyByUid[targetUid];
  if (existing && existing.length > 0) return existing;

  const profile =
    state.profiles.find((p) => p.uid === targetUid) ?? DEMO_TRAVELER_PROFILE;
  return profile.characters.slice(0, 4).map((c) => c.name);
}

export function getCoachStrategy(
  state: ProfileState,
  uid?: string
): CoachStrategyResponse | null {
  const targetUid = uid ?? state.activeUid;
  return state.coachStrategyByUid[targetUid] ?? null;
}

export function getCoachChat(
  state: ProfileState,
  uid?: string
): CoachFollowUpMessage[] {
  const targetUid = uid ?? state.activeUid;
  return state.coachChatByUid[targetUid] ?? [];
}

export function getCoachEngineMode(state: ProfileState): CoachEngineMode {
  return state.coachEngineMode ?? "gemini";
}

export function createProfileStore(
  adapter: StorageAdapter = new BrowserLocalStorageAdapter()
): ProfileStore {
  return new ProfileStore(adapter);
}

export const profileStore = new ProfileStore();
