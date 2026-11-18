import type {
  ArtifactSlot,
  ElementType,
  RawArtifactInput,
  RawSubstatInput,
  ShowcaseCharacter,
  TravelerProfile,
} from "@/types/genshin";
import { evaluateArtifacts, round1 } from "@/lib/build-engine";
import {
  getCharacterCombatRoles,
  inferActiveCombatRole,
} from "@/lib/character-roles";

export interface EnkaStoreCharacter {
  Element?: string;
  NameTextMapHash?: number | string;
  SideIconName?: string;
  SkillOrder?: number[];
  ProudMap?: Record<string, number>;
  QualityType?: string;
}

interface EnkaStoreAffix {
  propType?: string;
  efficiency?: number;
  position?: number;
}

export interface EnkaMetadataCache {
  characters: Record<string, EnkaStoreCharacter>;
  locEn: Record<string, string>;
  affixes: Record<string, EnkaStoreAffix>;
  fetchedAt: number;
}

interface CachedUidEntry {
  profile: TravelerProfile;
  expiresAt: number;
}

const METADATA_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
let metadataCache: EnkaMetadataCache | null = null;
const uidCache = new Map<string, CachedUidEntry>();

const ELEMENT_MAP: Record<string, ElementType> = {
  Fire: "Pyro",
  Water: "Hydro",
  Electric: "Electro",
  Ice: "Cryo",
  Grass: "Dendro",
  Wind: "Anemo",
  Rock: "Geo",
};

const EQUIP_SLOT_MAP: Record<string, ArtifactSlot> = {
  EQUIP_BRACER: "Flower",
  EQUIP_NECKLACE: "Plume",
  EQUIP_SHOES: "Sands",
  EQUIP_RING: "Goblet",
  EQUIP_DRESS: "Circlet",
};

const PROP_LABEL_MAP: Record<string, { label: string; isPercent: boolean }> = {
  FIGHT_PROP_HP: { label: "HP", isPercent: false },
  FIGHT_PROP_HP_PERCENT: { label: "HP%", isPercent: true },
  FIGHT_PROP_ATTACK: { label: "ATK", isPercent: false },
  FIGHT_PROP_ATTACK_PERCENT: { label: "ATK%", isPercent: true },
  FIGHT_PROP_DEFENSE: { label: "DEF", isPercent: false },
  FIGHT_PROP_DEFENSE_PERCENT: { label: "DEF%", isPercent: true },
  FIGHT_PROP_CRITICAL: { label: "CRIT Rate", isPercent: true },
  FIGHT_PROP_CRITICAL_HURT: { label: "CRIT DMG", isPercent: true },
  FIGHT_PROP_CHARGE_EFFICIENCY: { label: "Energy Recharge", isPercent: true },
  FIGHT_PROP_ELEMENT_MASTERY: { label: "Elemental Mastery", isPercent: false },
  FIGHT_PROP_HEAL_ADD: { label: "Healing Bonus", isPercent: true },
  FIGHT_PROP_PHYSICAL_ADD_HURT: { label: "Physical DMG Bonus", isPercent: true },
  FIGHT_PROP_FIRE_ADD_HURT: { label: "Pyro DMG Bonus", isPercent: true },
  FIGHT_PROP_ELEC_ADD_HURT: { label: "Electro DMG Bonus", isPercent: true },
  FIGHT_PROP_WATER_ADD_HURT: { label: "Hydro DMG Bonus", isPercent: true },
  FIGHT_PROP_GRASS_ADD_HURT: { label: "Dendro DMG Bonus", isPercent: true },
  FIGHT_PROP_WIND_ADD_HURT: { label: "Anemo DMG Bonus", isPercent: true },
  FIGHT_PROP_ROCK_ADD_HURT: { label: "Geo DMG Bonus", isPercent: true },
  FIGHT_PROP_ICE_ADD_HURT: { label: "Cryo DMG Bonus", isPercent: true },
};

const ELEMENT_DMG_PROP: Record<ElementType, { id: string; label: string }> = {
  Pyro: { id: "40", label: "Pyro DMG Bonus" },
  Electro: { id: "41", label: "Electro DMG Bonus" },
  Hydro: { id: "42", label: "Hydro DMG Bonus" },
  Dendro: { id: "43", label: "Dendro DMG Bonus" },
  Anemo: { id: "44", label: "Anemo DMG Bonus" },
  Geo: { id: "45", label: "Geo DMG Bonus" },
  Cryo: { id: "46", label: "Cryo DMG Bonus" },
};

const FALLBACK_CHARACTER_NAMES: Record<string, { name: string; element: ElementType }> = {
  "10000032": { name: "Bennett", element: "Pyro" },
  "10000047": { name: "Kaedehara Kazuha", element: "Anemo" },
  "10000052": { name: "Raiden Shogun", element: "Electro" },
  "10000060": { name: "Yelan", element: "Hydro" },
  "10000073": { name: "Nahida", element: "Dendro" },
  "10000087": { name: "Neuvillette", element: "Hydro" },
  "10000089": { name: "Furina", element: "Hydro" },
  "10000096": { name: "Arlecchino", element: "Pyro" },
  "10000030": { name: "Zhongli", element: "Geo" },
  "10000046": { name: "Hu Tao", element: "Pyro" },
  "10000078": { name: "Alhaitham", element: "Dendro" },
  "10000098": { name: "Clorinde", element: "Electro" },
  "10000106": { name: "Mavuika", element: "Pyro" },
  "10000107": { name: "Citlali", element: "Cryo" },
  "10000108": { name: "Mitya", element: "Electro" },
};

export async function getEnkaMetadata(forceRefresh = false): Promise<EnkaMetadataCache> {
  if (
    !forceRefresh &&
    metadataCache &&
    Date.now() - metadataCache.fetchedAt < METADATA_TTL_MS
  ) {
    return metadataCache;
  }

  try {
    const [charsRes, locRes, affixesRes] = await Promise.all([
      fetch(
        "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json",
        { next: { revalidate: 43200 } }
      ),
      fetch(
        "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/loc.json",
        { next: { revalidate: 43200 } }
      ),
      fetch(
        "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/affixes.json",
        { next: { revalidate: 43200 } }
      ),
    ]);

    if (!charsRes.ok || !locRes.ok) {
      throw new Error("Failed to fetch Enka store metadata");
    }

    const characters = (await charsRes.json()) as Record<string, EnkaStoreCharacter>;
    const locAll = (await locRes.json()) as { en?: Record<string, string> };
    const affixes = affixesRes.ok
      ? ((await affixesRes.json()) as Record<string, EnkaStoreAffix>)
      : metadataCache?.affixes ?? {};

    metadataCache = {
      characters,
      locEn: locAll.en ?? {},
      affixes,
      fetchedAt: Date.now(),
    };
    return metadataCache;
  } catch {
    return (
      metadataCache ?? {
        characters: {},
        locEn: {},
        affixes: {},
        fetchedAt: Date.now(),
      }
    );
  }
}

const ASCENSION_MAX_LEVELS = [20, 40, 50, 60, 70, 80, 90];

function inferElementFromFightProps(fpm: Record<string, number>): ElementType | undefined {
  let bestElement: ElementType | undefined;
  let bestVal = 0;
  for (const [el, meta] of Object.entries(ELEMENT_DMG_PROP) as [
    ElementType,
    { id: string; label: string },
  ][]) {
    const val = Number(fpm[meta.id] ?? 0);
    if (val > bestVal) {
      bestVal = val;
      bestElement = el;
    }
  }
  return bestVal > 0 ? bestElement : undefined;
}

function resolveLoc(
  locEn: Record<string, string>,
  hash: string | number | undefined,
  fallback: string
): string {
  if (hash === undefined || hash === null) return fallback;
  return locEn[String(hash)] ?? fallback;
}

function sideIconToAvatarIcon(sideIcon?: string): string | undefined {
  if (!sideIcon) return undefined;
  return `https://enka.network/ui/${sideIcon.replace("_Side_", "_")}.png`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCharacter(raw: any, meta: EnkaMetadataCache): ShowcaseCharacter {
  const avatarId = Number(raw.avatarId ?? 0);
  const depotKey = raw.skillDepotId ? `${avatarId}-${raw.skillDepotId}` : String(avatarId);
  const storeChar = meta.characters[depotKey] ?? meta.characters[String(avatarId)];

  const fpm: Record<string, number> = raw.fightPropMap ?? {};
  const fallbackMeta = FALLBACK_CHARACTER_NAMES[String(avatarId)];
  const name = resolveLoc(
    meta.locEn,
    storeChar?.NameTextMapHash,
    fallbackMeta?.name ?? `Character #${avatarId}`
  );

  const element: ElementType =
    (storeChar?.Element ? ELEMENT_MAP[storeChar.Element] : undefined) ??
    fallbackMeta?.element ??
    inferElementFromFightProps(fpm) ??
    "Pyro";

  const rawLevel = Number(raw.propMap?.["4001"]?.val);
  const level = Number.isFinite(rawLevel) && rawLevel > 0 ? rawLevel : 90;
  const ascension = Number(raw.propMap?.["1002"]?.val ?? 6);
  const maxLevel =
    level > 90
      ? level > 95
        ? 100
        : 95
      : (ASCENSION_MAX_LEVELS[ascension] ?? 90);
  const constellation = Array.isArray(raw.talentIdList) ? raw.talentIdList.length : 0;
  const friendship = Number(raw.fetterInfo?.expLevel ?? 1);

  const skillOrder = storeChar?.SkillOrder ?? [];
  const skillMap: Record<string, number> = raw.skillLevelMap ?? {};
  const extraSkillMap: Record<string, number> = raw.proudSkillExtraLevelMap ?? {};

  const getTalentLevel = (idx: number): number => {
    const skillId = skillOrder[idx];
    if (!skillId) {
      const vals = Object.values(skillMap);
      return Number(vals[idx] ?? 1);
    }
    const base = Number(skillMap[String(skillId)] ?? 1);
    const proudId = storeChar?.ProudMap?.[String(skillId)];
    const extra = proudId ? Number(extraSkillMap[String(proudId)] ?? 0) : 0;
    return base + extra;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const equipList: any[] = Array.isArray(raw.equipList) ? raw.equipList : [];
  const weaponEntry = equipList.find((e) => e.flat?.itemType === "ITEM_WEAPON");
  const relicEntries = equipList.filter((e) => e.flat?.itemType === "ITEM_RELIQUARY");

  const affixVals = weaponEntry?.weapon?.affixMap
    ? (Object.values(weaponEntry.weapon.affixMap) as number[])
    : [0];
  const refinement = Number(affixVals[0] ?? 0) + 1;

  const weaponStats = Array.isArray(weaponEntry?.flat?.weaponStats)
    ? weaponEntry.flat.weaponStats
    : [];
  const baseAtkStat = weaponStats.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => s.appendPropId === "FIGHT_PROP_BASE_ATTACK"
  );
  const subWeaponStat = weaponStats.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => s.appendPropId !== "FIGHT_PROP_BASE_ATTACK"
  );
  const subWeaponMeta = subWeaponStat
    ? PROP_LABEL_MAP[String(subWeaponStat.appendPropId)]
    : undefined;

  const weapon = {
    name: resolveLoc(meta.locEn, weaponEntry?.flat?.nameTextMapHash, "Equipped Weapon"),
    level: Number(weaponEntry?.weapon?.level ?? 90),
    refinement,
    rarity: Number(weaponEntry?.flat?.rankLevel ?? 5),
    baseAtk: Math.round(Number(baseAtkStat?.statValue ?? 0)),
    subStatLabel: subWeaponMeta?.label ?? "Substat",
    subStatValue: subWeaponStat
      ? `${subWeaponStat.statValue}${subWeaponMeta?.isPercent ? "%" : ""}`
      : "—",
    iconUrl: weaponEntry?.flat?.icon
      ? `https://enka.network/ui/${weaponEntry.flat.icon}.png`
      : undefined,
    passiveSummary: `Refinement Rank ${refinement} • Level ${weaponEntry?.weapon?.level ?? 90}`,
  };

  const rawArtifactInputs: RawArtifactInput[] = relicEntries.map((entry) => {
    const flat = entry.flat ?? {};
    const slot: ArtifactSlot = EQUIP_SLOT_MAP[String(flat.equipType)] ?? "Flower";
    const setName = resolveLoc(meta.locEn, flat.setNameTextMapHash, "Artifact Set");

    const mainPropId = String(flat.reliquaryMainStat?.mainPropId ?? "");
    const mainMeta = PROP_LABEL_MAP[mainPropId] ?? { label: mainPropId, isPercent: false };
    const mainValRaw = Number(flat.reliquaryMainStat?.statValue ?? 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawSubs: any[] = Array.isArray(flat.reliquarySubstats) ? flat.reliquarySubstats : [];
    const substats: RawSubstatInput[] = rawSubs.map((sub) => {
      const propId = String(sub.appendPropId ?? "");
      const subMeta = PROP_LABEL_MAP[propId] ?? { label: propId, isPercent: false };
      const numVal = Number(sub.statValue ?? 0);
      return {
        id: propId,
        propKey: propId,
        label: subMeta.label,
        value: numVal,
        isPercent: subMeta.isPercent,
      };
    });

    return {
      slot,
      name: resolveLoc(meta.locEn, flat.nameTextMapHash, `${setName} ${slot}`),
      setName,
      iconUrl: flat.icon ? `https://enka.network/ui/${flat.icon}.png` : undefined,
      level: Math.max(0, Number(entry.reliquary?.level ?? 21) - 1),
      rarity: Number(flat.rankLevel ?? 5),
      mainStat: {
        id: mainPropId,
        label: mainMeta.label,
        value: mainValRaw,
        isPercent: mainMeta.isPercent,
      },
      substats,
      affixIds: Array.isArray(entry.reliquary?.appendPropIdList)
        ? entry.reliquary.appendPropIdList.map(Number)
        : undefined,
    };
  });

  const elemDmgMeta = ELEMENT_DMG_PROP[element];
  const elemDmgBonus = round1((Number(fpm[elemDmgMeta.id] ?? 0)) * 100);
  const physicalDmgBonus = round1((Number(fpm["30"] ?? 0)) * 100);
  const healingBonus = round1((Number(fpm["26"] ?? 0)) * 100);

  const stats = {
    maxHp: Math.round(Number(fpm["2000"] ?? 0)),
    atk: Math.round(Number(fpm["2001"] ?? 0)),
    baseAtk: Math.round(Number(fpm["4"] ?? 0)),
    def: Math.round(Number(fpm["2002"] ?? 0)),
    em: Math.round(Number(fpm["28"] ?? 0)),
    critRate: round1(Number(fpm["20"] ?? 0) * 100),
    critDmg: round1(Number(fpm["22"] ?? 0) * 100),
    er: round1(Number(fpm["23"] ?? 1) * 100),
    elementalDmgLabel: elemDmgMeta.label,
    elementalDmgBonus: elemDmgBonus,
    ...(physicalDmgBonus > 0 ? { physicalDmgBonus } : {}),
    ...(healingBonus > 0 ? { healingBonus } : {}),
  };

  const evaluation = evaluateArtifacts(rawArtifactInputs, stats, meta.affixes);
  const roles = getCharacterCombatRoles(name, avatarId);

  const characterRecord: ShowcaseCharacter = {
    avatarId,
    name,
    element,
    rarity: storeChar?.QualityType === "QUALITY_PURPLE" ? 4 : 5,
    level,
    maxLevel,
    constellation,
    friendship,
    iconUrl: sideIconToAvatarIcon(storeChar?.SideIconName),
    sideIconUrl: storeChar?.SideIconName
      ? `https://enka.network/ui/${storeChar.SideIconName}.png`
      : undefined,
    talents: {
      normal: getTalentLevel(0),
      skill: getTalentLevel(1),
      burst: getTalentLevel(2),
    },
    weapon,
    artifactSets: evaluation.artifactSets,
    artifacts: evaluation.artifacts,
    stats,
    totalCv: evaluation.totalCv,
    buildTier: evaluation.buildTier,
    critique: evaluation.critique,
    roles,
  };

  const activeRole = inferActiveCombatRole(characterRecord);
  return {
    ...characterRecord,
    activeRole,
  };
}

export async function fetchEnkaProfile(uid: string): Promise<TravelerProfile> {
  const cleanUid = uid.trim();
  if (!/^\d{9,10}$/.test(cleanUid)) {
    throw new Error("Please enter a valid 9- or 10-digit Genshin Impact UID.");
  }

  const cached = uidCache.get(cleanUid);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.profile,
      cached: true,
      nextRefreshAt: new Date(cached.expiresAt).toISOString(),
    };
  }

  const [res, initialMeta] = await Promise.all([
    fetch(`https://enka.network/api/uid/${cleanUid}`, {
      headers: {
        "User-Agent": "TeyvatStrategist/1.0 (local-next-app)",
        Accept: "application/json",
      },
      cache: "no-store",
    }),
    getEnkaMetadata(),
  ]);

  if (!res.ok) {
    if (res.status === 400) throw new Error("Invalid UID format rejected by Enka.Network.");
    if (res.status === 404) throw new Error(`UID ${cleanUid} was not found.`);
    if (res.status === 424) throw new Error("Genshin Impact servers or Enka.Network are under maintenance.");
    if (res.status === 429) throw new Error("Rate limited by Enka.Network. Please wait a minute before syncing again.");
    throw new Error(`Enka.Network returned HTTP ${res.status}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any;
  const p = data.playerInfo ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawAvatars: any[] = Array.isArray(data.avatarInfoList) ? data.avatarInfoList : [];

  // Refresh metadata once if any showcased character is missing from the cached store
  let meta = initialMeta;
  const hasUnknownAvatar = rawAvatars.some((avatar) => {
    const id = String(avatar.avatarId ?? "");
    const depotKey = avatar.skillDepotId ? `${id}-${avatar.skillDepotId}` : id;
    return !meta.characters[depotKey] && !meta.characters[id];
  });
  if (hasUnknownAvatar && Date.now() - meta.fetchedAt > 60_000) {
    meta = await getEnkaMetadata(true);
  }

  const characters = rawAvatars.map((avatar) => parseCharacter(avatar, meta));
  const ttlSeconds = Math.max(60, Number(data.ttl ?? 180));
  const expiresAt = Date.now() + ttlSeconds * 1000;

  const abyssFloor =
    p.towerFloorIndex && p.towerLevelIndex
      ? `${p.towerFloorIndex}-${p.towerLevelIndex}`
      : "—";

  const profile: TravelerProfile = {
    uid: cleanUid,
    nickname: String(p.nickname ?? `Traveler ${cleanUid}`),
    signature: String(p.signature ?? ""),
    ar: Number(p.level ?? 1),
    worldLevel: Number(p.worldLevel ?? 0),
    achievements: Number(p.finishAchievementNum ?? 0),
    abyssFloor,
    abyssStars: p.towerStarIndex !== undefined ? `${p.towerStarIndex}/36` : "—",
    theaterAct: p.theaterActIndex ? `Act ${p.theaterActIndex}` : "—",
    theaterMedals: Number(p.theaterStarIndex ?? 0),
    avatarCount: Array.isArray(p.showAvatarInfoList) ? p.showAvatarInfoList.length : characters.length,
    lv90Count: characters.filter((c) => c.level >= 90).length,
    characters,
    syncedAt: new Date().toISOString(),
    source: "enka",
    ttlSeconds,
    cached: false,
    nextRefreshAt: new Date(expiresAt).toISOString(),
    warning:
      characters.length === 0
        ? "Public Character Showcase details are hidden in-game for this UID. Enable 'Show Character Details' in Genshin Impact to inspect full builds."
        : undefined,
  };

  uidCache.set(cleanUid, {
    profile,
    expiresAt,
  });

  return profile;
}
