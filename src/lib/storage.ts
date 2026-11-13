import { DEFAULT_DIRECTIVES, DEMO_TRAVELER_PROFILE } from "@/lib/demo-data";
import type {
  CoachFollowUpMessage,
  CoachStrategyResponse,
  DailyDirectives,
  EquipmentCoachQueryResponse,
  HoyolabCheckinState,
  HoyolabCredentialsPayload,
  TravelerProfile,
} from "@/types/genshin";

const KEYS = {
  PROFILES: "teyvat_strategist_profiles_v1",
  ACTIVE_UID: "teyvat_strategist_active_uid_v1",
  DIRECTIVES: "teyvat_strategist_directives_v1",
  DIRECTIVES_BY_UID: "teyvat_strategist_directives_by_uid_v1",
  PARTY_BY_UID: "teyvat_strategist_party_by_uid_v1",
  COACH_STRATEGY_BY_UID: "teyvat_strategist_coach_strategy_by_uid_v1",
  COACH_CHAT_BY_UID: "teyvat_strategist_coach_chat_by_uid_v1",
  HOYOLAB_CREDS: "teyvat_strategist_hoyolab_creds_v1",
  HOYOLAB_CHECKIN: "teyvat_strategist_hoyolab_checkin_v1",
  GEMINI_API_KEY: "teyvat_strategist_gemini_key_v1",
  EQUIPMENT_ADVICE_BY_CHAR: "teyvat_strategist_equipment_advice_v1",
} as const;

export function getHoyolabUtc8Date(now = new Date()): string {
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const year = utc8.getUTCFullYear();
  const month = String(utc8.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utc8.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const RESIN_REGEN_MS = 8 * 60 * 1000;

export function reconcileResinDirectives(
  directives: DailyDirectives,
  nowMs = Date.now()
): DailyDirectives {
  const lastMs = Date.parse(directives.lastUpdatedAt);
  const maxResin = directives.maxResin > 0 ? directives.maxResin : 200;
  if (!Number.isFinite(lastMs) || directives.resin >= maxResin) {
    const recoverySeconds = directives.resin >= maxResin ? 0 : directives.resinRecoverySeconds ?? Math.max(0, (maxResin - directives.resin) * 480);
    return {
      ...directives,
      maxResin,
      resinRecoverySeconds: recoverySeconds,
    };
  }
  const elapsedMs = Math.max(0, nowMs - lastMs);
  const gained = Math.floor(elapsedMs / RESIN_REGEN_MS);
  if (gained <= 0) {
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const existingRecovery = directives.resinRecoverySeconds ?? (maxResin - directives.resin) * 480;
    return {
      ...directives,
      maxResin,
      resinRecoverySeconds: Math.max(0, existingRecovery - elapsedSeconds),
    };
  }
  const nextResin = Math.min(maxResin, directives.resin + gained);
  const consumedMs = gained * RESIN_REGEN_MS;
  const remainingSeconds = Math.max(0, (maxResin - nextResin) * 480);
  return {
    ...directives,
    resin: nextResin,
    maxResin,
    resinRecoverySeconds: remainingSeconds,
    lastUpdatedAt: new Date(
      nextResin >= maxResin ? nowMs : lastMs + consumedMs
    ).toISOString(),
  };
}

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadSavedProfiles(): TravelerProfile[] {
  const saved = safeReadJson<TravelerProfile[]>(KEYS.PROFILES, []);
  if (saved.length === 0) {
    return [DEMO_TRAVELER_PROFILE];
  }
  // Ensure the demo profile stays in sync with current DEMO_TRAVELER_PROFILE roster (e.g. Mitya)
  const demoIdx = saved.findIndex((p) => p.uid === DEMO_TRAVELER_PROFILE.uid);
  if (demoIdx !== -1) {
    const hasAllDemoChars = DEMO_TRAVELER_PROFILE.characters.every((dc) =>
      saved[demoIdx].characters.some((sc) => Number(sc.avatarId) === Number(dc.avatarId))
    );
    if (!hasAllDemoChars) {
      saved[demoIdx] = DEMO_TRAVELER_PROFILE;
      safeWriteJson(KEYS.PROFILES, saved);
    }
  }
  return saved;
}

export function saveProfile(profile: TravelerProfile): TravelerProfile[] {
  const existing = loadSavedProfiles().filter((p) => p.uid !== profile.uid);
  const next = [profile, ...existing].slice(0, 8);
  safeWriteJson(KEYS.PROFILES, next);
  safeWriteJson(KEYS.ACTIVE_UID, profile.uid);
  return next;
}

export function removeProfile(uid: string): TravelerProfile[] {
  const remaining = loadSavedProfiles().filter((p) => p.uid !== uid);
  const next = remaining.length > 0 ? remaining : [DEMO_TRAVELER_PROFILE];
  safeWriteJson(KEYS.PROFILES, next);
  safeWriteJson(KEYS.ACTIVE_UID, next[0].uid);
  return next;
}

export function loadActiveUid(): string {
  return safeReadJson<string>(KEYS.ACTIVE_UID, DEMO_TRAVELER_PROFILE.uid);
}

export function saveActiveUid(uid: string): void {
  safeWriteJson(KEYS.ACTIVE_UID, uid);
}

export function loadDirectives(uid?: string): DailyDirectives {
  if (uid) {
    const byUid = safeReadJson<Record<string, DailyDirectives>>(
      KEYS.DIRECTIVES_BY_UID,
      {}
    );
    if (byUid[uid]) {
      return reconcileResinDirectives(byUid[uid]);
    }
  }
  const loaded = safeReadJson<DailyDirectives>(KEYS.DIRECTIVES, DEFAULT_DIRECTIVES);
  return reconcileResinDirectives(loaded);
}

export function saveDirectives(
  directives: DailyDirectives,
  preserveTimestamp = false,
  uid?: string
): void {
  const stamped = {
    ...directives,
    lastUpdatedAt: preserveTimestamp
      ? directives.lastUpdatedAt
      : new Date().toISOString(),
  };
  safeWriteJson(KEYS.DIRECTIVES, stamped);
  if (uid) {
    const byUid = safeReadJson<Record<string, DailyDirectives>>(
      KEYS.DIRECTIVES_BY_UID,
      {}
    );
    safeWriteJson(KEYS.DIRECTIVES_BY_UID, { ...byUid, [uid]: stamped });
  }
}

export function loadSavedPartyNames(
  uid: string,
  fallbackNames: string[] = ["Arlecchino", "Yelan", "Kaedehara Kazuha", "Bennett"]
): string[] {
  const byUid = safeReadJson<Record<string, string[]>>(KEYS.PARTY_BY_UID, {});
  return byUid[uid] && byUid[uid].length > 0 ? byUid[uid] : fallbackNames;
}

export function savePartyNames(uid: string, names: string[]): void {
  const byUid = safeReadJson<Record<string, string[]>>(KEYS.PARTY_BY_UID, {});
  safeWriteJson(KEYS.PARTY_BY_UID, { ...byUid, [uid]: names });
}

export function loadSavedCoachStrategy(uid: string): CoachStrategyResponse | null {
  const byUid = safeReadJson<Record<string, CoachStrategyResponse | null>>(
    KEYS.COACH_STRATEGY_BY_UID,
    {}
  );
  return byUid[uid] ?? null;
}

export function saveCoachStrategy(
  uid: string,
  strategy: CoachStrategyResponse | null
): void {
  const byUid = safeReadJson<Record<string, CoachStrategyResponse | null>>(
    KEYS.COACH_STRATEGY_BY_UID,
    {}
  );
  safeWriteJson(KEYS.COACH_STRATEGY_BY_UID, { ...byUid, [uid]: strategy });
}

export function loadCoachChat(uid: string): CoachFollowUpMessage[] {
  const byUid = safeReadJson<Record<string, CoachFollowUpMessage[]>>(
    KEYS.COACH_CHAT_BY_UID,
    {}
  );
  return byUid[uid] ?? [];
}

export function saveCoachChat(
  uid: string,
  messages: CoachFollowUpMessage[]
): void {
  const byUid = safeReadJson<Record<string, CoachFollowUpMessage[]>>(
    KEYS.COACH_CHAT_BY_UID,
    {}
  );
  safeWriteJson(KEYS.COACH_CHAT_BY_UID, {
    ...byUid,
    [uid]: messages.slice(-20),
  });
}

export function loadSavedHoyolabCredentials(): HoyolabCredentialsPayload | null {
  return safeReadJson<HoyolabCredentialsPayload | null>(
    KEYS.HOYOLAB_CREDS,
    null
  );
}

export function saveHoyolabCredentials(
  creds: HoyolabCredentialsPayload
): void {
  safeWriteJson(KEYS.HOYOLAB_CREDS, creds);
}

export function clearHoyolabCredentials(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEYS.HOYOLAB_CREDS);
  } catch {
    // Ignore storage errors
  }
}

export function loadSavedCheckinState(): HoyolabCheckinState | null {
  return safeReadJson<HoyolabCheckinState | null>(KEYS.HOYOLAB_CHECKIN, null);
}

export function saveCheckinState(state: HoyolabCheckinState): void {
  safeWriteJson(KEYS.HOYOLAB_CHECKIN, state);
}

export function clearCheckinState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEYS.HOYOLAB_CHECKIN);
  } catch {
    // Ignore storage errors
  }
}

export function loadSavedGeminiApiKey(): string {
  return safeReadJson<string>(KEYS.GEMINI_API_KEY, "");
}

export function saveGeminiApiKey(apiKey: string): void {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    clearGeminiApiKey();
    return;
  }
  safeWriteJson(KEYS.GEMINI_API_KEY, trimmed);
}

export function clearGeminiApiKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEYS.GEMINI_API_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function loadSavedEquipmentAdvice(
  characterKey: string | number
): EquipmentCoachQueryResponse | null {
  const all = safeReadJson<Record<string, EquipmentCoachQueryResponse>>(
    KEYS.EQUIPMENT_ADVICE_BY_CHAR,
    {}
  );
  return all[String(characterKey)] ?? null;
}

export function saveEquipmentAdvice(
  characterKey: string | number,
  advice: EquipmentCoachQueryResponse,
  fallbackName?: string
): void {
  const all = safeReadJson<Record<string, EquipmentCoachQueryResponse>>(
    KEYS.EQUIPMENT_ADVICE_BY_CHAR,
    {}
  );
  const next = { ...all, [String(characterKey)]: advice };
  if (fallbackName) {
    next[fallbackName] = advice;
  }
  safeWriteJson(KEYS.EQUIPMENT_ADVICE_BY_CHAR, next);
}

