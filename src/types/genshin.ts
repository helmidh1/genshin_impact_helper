export type ElementType =
  | "Pyro"
  | "Hydro"
  | "Electro"
  | "Cryo"
  | "Dendro"
  | "Anemo"
  | "Geo";

export type ArtifactSlot =
  | "Flower"
  | "Plume"
  | "Sands"
  | "Goblet"
  | "Circlet";

export type RollTier =
  | "God Roll"
  | "SS"
  | "S"
  | "A"
  | "Needs Upgrade";

export interface SubstatRoll {
  label: string;
  value: string;
  numericValue: number;
  rolls: number;
  wasted?: boolean;
}

export interface ArtifactPiece {
  slot: ArtifactSlot;
  name: string;
  setName: string;
  iconUrl?: string;
  level: number;
  rarity: number;
  mainStatLabel: string;
  mainStatValue: string;
  substats: SubstatRoll[];
  critValue: number;
  tier: RollTier;
}

export interface WeaponInfo {
  name: string;
  level: number;
  refinement: number;
  rarity: number;
  baseAtk: number;
  subStatLabel: string;
  subStatValue: string;
  iconUrl?: string;
  passiveSummary: string;
}

export interface CharacterStats {
  maxHp: number;
  atk: number;
  baseAtk?: number;
  def: number;
  em: number;
  critRate: number;
  critDmg: number;
  er: number;
  elementalDmgLabel?: string;
  elementalDmgBonus?: number;
}

export interface ShowcaseCharacter {
  avatarId: number;
  name: string;
  title?: string;
  element: ElementType;
  level: number;
  maxLevel: number;
  constellation: number;
  friendship: number;
  iconUrl?: string;
  sideIconUrl?: string;
  talents: {
    normal: number;
    skill: number;
    burst: number;
  };
  weapon: WeaponInfo;
  artifactSets: {
    name: string;
    count: number;
    bonusSummary?: string;
  }[];
  artifacts: ArtifactPiece[];
  stats: CharacterStats;
  totalCv: number;
  buildTier: string;
  critique?: {
    bottleneck: string;
    recommendation: string;
  };
}

export interface TravelerProfile {
  uid: string;
  nickname: string;
  signature: string;
  ar: number;
  worldLevel: number;
  achievements: number;
  abyssFloor: string;
  abyssStars: string;
  theaterAct: string;
  theaterMedals: number;
  avatarCount: number;
  lv90Count: number;
  characters: ShowcaseCharacter[];
  syncedAt: string;
  source: "enka" | "demo";
  ttlSeconds?: number;
  warning?: string;
}

export interface CustomGoal {
  id: string;
  text: string;
  done: boolean;
}

export interface DailyDirectives {
  resin: number;
  maxResin: number;
  condensedResin: number;
  realmCurrency: number;
  maxRealmCurrency: number;
  weeklyBossesDone: number;
  dailyCommissionsDone: number;
  parametricReady: boolean;
  customGoals: CustomGoal[];
  lastUpdatedAt: string;
}

export interface EncounterPreset {
  id: string;
  name: string;
  location: string;
  level: number;
  hpLabel: string;
  resistances: { label: string; value: string; element?: ElementType }[];
  mechanicsAlert: string;
}

export type CoachingFocus =
  | "Optimal Rotation"
  | "ER & Burst Uptime"
  | "Combo Mechanics"
  | "Gear Priority";

export interface RotationStep {
  step: number;
  timeRange: string;
  character: string;
  element: ElementType;
  action: string;
  notes: string;
}

export interface BuffBar {
  name: string;
  duration: string;
  color: string;
  startPct: number;
  widthPct: number;
}

export interface EnergyCheck {
  character: string;
  element: ElementType;
  currentEr: number;
  recommendedEr: number;
  status: "Optimal" | "Self-Sufficient" | "Deficit";
  advice: string;
}

export interface CoachStrategyResponse {
  teamName: string;
  rotationDuration: string;
  estimatedDpsLabel: string;
  criticalNote: string;
  rotationSteps: RotationStep[];
  buffBars: BuffBar[];
  energyChecks: EnergyCheck[];
  executionCards: {
    title: string;
    rule: string;
    detail: string;
  }[];
  upgradePriorities: string[];
  source: "gemini" | "fallback";
  interactionId?: string;
  note?: string;
}

export interface CoachFollowUpMessage {
  id: string;
  role: "user" | "coach";
  text: string;
  timestamp: string;
}
