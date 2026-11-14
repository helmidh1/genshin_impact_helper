import { tallyArtifactSets } from "@/lib/build-engine";
import type {
  ArtifactPiece,
  ArtifactSlot,
  DailyDirectives,
  ElementType,
  EncounterPreset,
  ShowcaseCharacter,
  TravelerProfile,
  WeaponInfo,
} from "@/types/genshin";
import type { StorageAdapter } from "@/lib/profile-store";

/**
 * Centralized test fixtures and mock builders for Teyvat Strategist.
 * Ensures domain interface fidelity and full relic/talent completeness by construction.
 */

export function createMockArtifactPiece(
  slot: ArtifactSlot,
  setName: string = "Gladiator's Finale",
  overrides?: Partial<ArtifactPiece>
): ArtifactPiece {
  const slotDefaults: Record<
    ArtifactSlot,
    { name: string; mainStatLabel: string; mainStatValue: string; critValue: number }
  > = {
    Flower: { name: "Flower of Life", mainStatLabel: "HP", mainStatValue: "4780", critValue: 35.0 },
    Plume: { name: "Plume of Death", mainStatLabel: "ATK", mainStatValue: "311", critValue: 32.0 },
    Sands: { name: "Sands of Eon", mainStatLabel: "ATK%", mainStatValue: "46.6%", critValue: 28.0 },
    Goblet: { name: "Goblet of Eonothem", mainStatLabel: "Pyro DMG Bonus", mainStatValue: "46.6%", critValue: 30.0 },
    Circlet: { name: "Circlet of Logos", mainStatLabel: "CRIT Rate", mainStatValue: "31.1%", critValue: 24.0 },
  };

  const def = slotDefaults[slot];
  return {
    slot,
    name: def.name,
    setName,
    rarity: 5,
    level: 20,
    mainStatLabel: def.mainStatLabel,
    mainStatValue: def.mainStatValue,
    substats: [],
    critValue: def.critValue,
    tier: def.critValue >= 35 ? "SS" : def.critValue >= 28 ? "S" : "A",
    ...overrides,
  };
}

export function createMockArtifacts(
  setNames: string[] = [
    "Noblesse Oblige",
    "Noblesse Oblige",
    "Noblesse Oblige",
    "Noblesse Oblige",
    "Gladiator's Finale",
  ],
  mainStats?: { sands?: string; goblet?: string; circlet?: string }
): ArtifactPiece[] {
  return [
    createMockArtifactPiece("Flower", setNames[0] || "Noblesse Oblige"),
    createMockArtifactPiece("Plume", setNames[1] || "Noblesse Oblige"),
    createMockArtifactPiece("Sands", setNames[2] || "Noblesse Oblige", {
      mainStatLabel: mainStats?.sands ?? "ATK%",
    }),
    createMockArtifactPiece("Goblet", setNames[3] || "Noblesse Oblige", {
      mainStatLabel: mainStats?.goblet ?? "Pyro DMG Bonus",
    }),
    createMockArtifactPiece("Circlet", setNames[4] || "Noblesse Oblige", {
      mainStatLabel: mainStats?.circlet ?? "CRIT Rate",
    }),
  ];
}

export function createMockWeapon(
  name: string = "Iron Sting",
  overrides?: Partial<WeaponInfo>
): WeaponInfo {
  return {
    name,
    level: 90,
    refinement: 1,
    rarity: 4,
    baseAtk: 510,
    subStatLabel: "Elemental Mastery",
    subStatValue: "165",
    passiveSummary: "Inflicting Elemental DMG increases all DMG by 6% for 6s.",
    ...overrides,
  };
}

export function createMockCharacter(
  name: string,
  element: ElementType,
  overrides?: Partial<ShowcaseCharacter>
): ShowcaseCharacter {
  const artifacts = overrides?.artifacts ?? createMockArtifacts();
  const setNames = artifacts.map((a) => a.setName);

  return {
    avatarId: 10000000 + Math.floor(Math.random() * 999999),
    name,
    element,
    level: 90,
    maxLevel: 90,
    constellation: 0,
    friendship: 10,
    talents: { normal: 9, skill: 9, burst: 9 },
    weapon: createMockWeapon(),
    artifactSets: tallyArtifactSets(setNames),
    artifacts,
    stats: {
      maxHp: 20000,
      atk: 1800,
      def: 800,
      em: 100,
      critRate: 65.0,
      critDmg: 130.0,
      er: 160.0,
    },
    totalCv: 180.0,
    buildTier: "S Tier",
    ...overrides,
  };
}

export function createMockEncounter(
  overrides?: Partial<EncounterPreset>
): EncounterPreset {
  return {
    id: "abyss-12-1-pma",
    name: "Perpetual Mechanical Array",
    location: "Spiral Abyss Floor 12 Chamber 1",
    level: 100,
    hpLabel: "2,200,000 HP",
    resistances: [
      { label: "Phys", value: "70%" },
      { label: "Pyro", value: "10%", element: "Pyro" },
      { label: "Hydro", value: "10%", element: "Hydro" },
    ],
    mechanicsAlert:
      "Vulnerability State: Drops -50% all RES for 20s after defeating ruin minion.",
    ...overrides,
  };
}

export function createMockDirectives(
  overrides?: Partial<DailyDirectives>
): DailyDirectives {
  return {
    resin: 120,
    maxResin: 200,
    resinRecoverySeconds: 38400,
    condensedResin: 2,
    realmCurrency: 1800,
    maxRealmCurrency: 2400,
    realmCurrencyRecoverySeconds: 12000,
    weeklyBossDiscountsRemaining: 3,
    weeklyBossesDone: 0,
    weeklyBossDiscountLimit: 3,
    dailyCommissionsDone: 4,
    totalCommissions: 4,
    extraRewardClaimed: true,
    expeditionsCount: 5,
    maxExpeditions: 5,
    expeditionsFinished: 5,
    parametricReady: true,
    parametricRecoveryText: "Ready to use",
    customGoals: [],
    source: "demo",
    lastUpdatedAt: new Date("2026-03-01T12:00:00Z").toISOString(),
    ...overrides,
  };
}

export function createMockProfile(
  uid: string = "100000000",
  nickname: string = "Traveler",
  overrides?: Partial<TravelerProfile>
): TravelerProfile {
  return {
    uid,
    nickname,
    signature: "Testing showcase profile",
    ar: 60,
    worldLevel: 9,
    achievements: 1000,
    abyssFloor: "12-3",
    abyssStars: "36/36",
    theaterAct: "Act 8",
    theaterMedals: 6,
    avatarCount: 60,
    lv90Count: 30,
    syncedAt: new Date().toISOString(),
    source: "demo",
    characters: [createMockCharacter("Arlecchino", "Pyro")],
    ...overrides,
  };
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
