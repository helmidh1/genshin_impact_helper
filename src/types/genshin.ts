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

export type ScalingArchetype = "crit-dps" | "hp-support" | "def-scaler" | "em-driver";

export interface RawSubstatInput {
  id?: string | number;
  propKey?: string;
  label: string;
  value: number;
  isPercent?: boolean;
  rolls?: number;
}

export interface RawArtifactInput {
  slot: ArtifactSlot;
  name?: string;
  setName: string;
  level: number;
  rarity: number;
  iconUrl?: string;
  mainStat: {
    id?: string | number;
    label: string;
    value: number;
    isPercent?: boolean;
  };
  substats: RawSubstatInput[];
  affixIds?: number[];
}

export interface BuildEvaluationResult {
  totalCv: number;
  buildTier: string;
  critique?: {
    bottleneck: string;
    recommendation: string;
  };
  artifactSets: Array<{
    name: string;
    count: number;
    bonusSummary: string;
  }>;
  artifacts: ArtifactPiece[];
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
  physicalDmgBonus?: number;
  healingBonus?: number;
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
  source: "enka" | "hoyolab" | "demo";
  ttlSeconds?: number;
  cached?: boolean;
  nextRefreshAt?: string;
  warning?: string;
}

export interface HoyolabCredentialsPayload {
  uid?: string;
  ltuid?: string;
  ltoken?: string;
  ltmid?: string;
  cookieString?: string;
}

export interface HoyolabSyncResponse {
  profile: TravelerProfile;
  liveDirectives?: Partial<DailyDirectives>;
  notesError?: string;
}

export type HoyolabCheckinAction = "status" | "ensure" | "claim";

export type HoyolabCheckinStatus =
  | "claimed"
  | "already_claimed"
  | "ready"
  | "risk_challenge"
  | "error";

export interface HoyolabCheckinAward {
  day: number;
  name: string;
  count: number;
  iconUrl: string;
}

export interface HoyolabCheckinState {
  status: HoyolabCheckinStatus;
  checkedInToday: boolean;
  utc8Date: string;
  month: number;
  totalSignDays: number;
  missedDays: number;
  todayReward?: HoyolabCheckinAward;
  awards: HoyolabCheckinAward[];
  message: string;
  checkedAt: string;
  accountTag?: string;
}

export interface HoyolabCheckinRequest extends HoyolabCredentialsPayload {
  action?: HoyolabCheckinAction;
  lang?: string;
}

export interface CustomGoal {
  id: string;
  text: string;
  done: boolean;
}

export interface DailyDirectives {
  resin: number;
  maxResin: number;
  resinRecoverySeconds?: number;
  condensedResin: number;
  realmCurrency: number;
  maxRealmCurrency: number;
  realmCurrencyRecoverySeconds?: number;
  weeklyBossDiscountsRemaining?: number;
  weeklyBossesDone: number;
  weeklyBossDiscountLimit?: number;
  dailyCommissionsDone: number;
  totalCommissions?: number;
  extraRewardClaimed?: boolean;
  expeditionsCount?: number;
  maxExpeditions?: number;
  expeditionsFinished?: number;
  parametricReady: boolean;
  parametricRecoveryText?: string;
  customGoals?: CustomGoal[];
  lastUpdatedAt: string;
  source?: "hoyolab" | "demo" | "synced";
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

export type WeaponRecommendationTier =
  | "BiS (Signature)"
  | "Top Alternative (5★)"
  | "Best 4★ / F2P"
  | "Situational / Alternative";

export interface WeaponRecommendation {
  name: string;
  rarity: number;
  tier: WeaponRecommendationTier;
  reason: string;
  refinementPriority?: string;
  sourceNote?: string;
}

export interface ArtifactSetRecommendation {
  name: string;
  type: "4-Piece" | "2-Piece Combo" | "Alternative";
  count: number;
  bonusSummary: string;
  reason: string;
  recommendedWeapons?: WeaponRecommendation[];
  weaponSynergyNotes?: Record<string, string>;
  mainStatOverrides?: Partial<MainStatRecommendations>;
}

export interface MainStatRecommendations {
  sands: string[];
  goblet: string[];
  circlet: string[];
}

export interface StatBenchmarks {
  critRatio: string;
  recommendedEr: string;
  keySubstats: string[];
  targetNotes: string;
}

export interface BuildArchetype {
  id: string;
  name: string;
  description: string;
  bestWeapons: WeaponRecommendation[];
  bestArtifactSets: ArtifactSetRecommendation[];
  mainStats: MainStatRecommendations;
  benchmarks: StatBenchmarks;
  talentPriority: string[];
}

export interface CharacterEquipmentGuide {
  characterName: string;
  element: ElementType;
  weaponType: "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";
  role: string;
  overview: string;
  archetypes: BuildArchetype[];
  guideLinks: {
    game8Url: string;
    icyVeinsUrl: string;
    kqmUrl: string;
    genshinGgUrl: string;
  };
}

export interface EquipmentComparison {
  weaponStatus: "bis_match" | "recommended_match" | "alternative" | "suboptimal";
  weaponFeedback: string;
  artifactSetStatus: "full_match" | "partial_match" | "mismatch";
  artifactSetFeedback: string;
  mainStatsStatus: {
    sands: "optimal" | "acceptable" | "suboptimal" | "unknown";
    goblet: "optimal" | "acceptable" | "suboptimal" | "unknown";
    circlet: "optimal" | "acceptable" | "suboptimal" | "unknown";
  };
  erStatus: "optimal" | "close" | "deficit";
  erFeedback: string;
}

export interface EquipmentCoachQueryResponse {
  characterName: string;
  archetypeName: string;
  selectedArtifactSetName?: string;
  summary: string;
  weaponAdvice: string;
  artifactAdvice: string;
  statPriorityAdvice: string;
  comparisonVerdict: string;
  actionableNextSteps: string[];
  externalReferenceNote: string;
  source: "gemini" | "fallback";
  interactionId?: string;
}

