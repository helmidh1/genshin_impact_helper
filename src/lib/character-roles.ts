import type { CombatRole, ShowcaseCharacter } from "@/types/genshin";

export function normalizeCharacterName(name: string): string {
  const trimmed = typeof name === "string" ? name.trim() : "";
  const aliasMap: Record<string, string> = {
    Kazuha: "Kaedehara Kazuha",
    Raiden: "Raiden Shogun",
    "Raiden Ei": "Raiden Shogun",
    Shogun: "Raiden Shogun",
    Ayaka: "Kamisato Ayaka",
    Ayato: "Kamisato Ayato",
    Itto: "Arataki Itto",
    Kokomi: "Sangonomiya Kokomi",
    Heizou: "Shikanoin Heizou",
    Yae: "Yae Miko",
    Sara: "Kujou Sara",
    Shinobu: "Kuki Shinobu",
  };
  return aliasMap[trimmed] ?? trimmed;
}

// Canonical mapping of character avatar IDs to character names
export const AVATAR_ID_TO_CANONICAL_NAME: Record<number, string> = {
  10000108: "Mitya",
  10000096: "Arlecchino",
  10000089: "Furina",
  10000087: "Neuvillette",
  10000073: "Nahida",
  10000047: "Kaedehara Kazuha",
  10000052: "Raiden Shogun",
  10000032: "Bennett",
  10000060: "Yelan",
  10000030: "Zhongli",
  10000046: "Hu Tao",
  10000023: "Xiangling",
  10000015: "Xingqiu",
  10000002: "Kamisato Ayaka",
  10000066: "Kamisato Ayato",
  10000078: "Alhaitham",
  10000098: "Clorinde",
  10000091: "Navia",
  10000026: "Xiao",
  10000075: "Wanderer",
  10000037: "Ganyu",
  10000042: "Keqing",
  10000031: "Fischl",
  10000016: "Diluc",
  10000003: "Jean",
  10000041: "Mona",
  10000069: "Tighnari",
  10000071: "Cyno",
  10000070: "Nilou",
  10000065: "Kuki Shinobu",
  10000043: "Sucrose",
  10000103: "Xilonen",
  10000101: "Kinich",
  10000102: "Mualani",
  10000104: "Chasca",
  10000107: "Citlali",
  10000106: "Mavuika",
  10000022: "Venti",
  10000033: "Tartaglia",
  10000038: "Albedo",
  10000051: "Eula",
  10000049: "Yoimiya",
  10000058: "Yae Miko",
  10000063: "Shenhe",
  10000057: "Arataki Itto",
  10000082: "Baizhu",
  10000084: "Lyney",
  10000086: "Wriothesley",
  10000093: "Xianyun",
  10000099: "Emilie",
  10000079: "Dehya",
  10000077: "Yaoyao",
  10000014: "Barbara",
  10000034: "Noelle",
  10000039: "Diona",
  10000045: "Rosaria",
  10000024: "Beidou",
  10000053: "Sayu",
  10000054: "Sangonomiya Kokomi",
  10000055: "Gorou",
  10000056: "Kujou Sara",
  10000059: "Shikanoin Heizou",
  10000062: "Yun Jin",
  10000064: "Yunjin",
  10000067: "Collei",
  10000068: "Dori",
  10000072: "Candace",
  10000074: "Layla",
  10000076: "Faruzan",
  10000080: "Mika",
  10000081: "Kaveh",
  10000083: "Kirara",
  10000085: "Freminet",
  10000088: "Wriothesley",
  10000090: "Charlotte",
  10000092: "Chevreuse",
  10000094: "Gaming",
  10000095: "Chiori",
  10000097: "Sethos",
  10000100: "Kachina",
  10000105: "Ororon",
  10000109: "Valeriy",
};

// Canonical eligible combat roles for each character in Genshin Impact
export const CHARACTER_COMBAT_ROLES: Record<string, CombatRole[]> = {
  // Pure Hypercarries / On-field DPS
  Neuvillette: ["On-Field DPS"],
  Arlecchino: ["On-Field DPS"],
  "Hu Tao": ["On-Field DPS"],
  Xiao: ["On-Field DPS"],
  Alhaitham: ["On-Field DPS"],
  Clorinde: ["On-Field DPS"],
  Kinich: ["On-Field DPS"],
  Mualani: ["On-Field DPS"],
  Chasca: ["On-Field DPS"],
  "Arataki Itto": ["On-Field DPS"],
  Lyney: ["On-Field DPS"],
  Wriothesley: ["On-Field DPS"],
  Diluc: ["On-Field DPS"],
  Yoimiya: ["On-Field DPS"],
  Cyno: ["On-Field DPS"],
  Eula: ["On-Field DPS"],
  Keqing: ["On-Field DPS"],
  Wanderer: ["On-Field DPS"],
  Gaming: ["On-Field DPS"],
  Sethos: ["On-Field DPS"],

  // Versatile Multi-Role Units
  "Raiden Shogun": ["On-Field DPS", "Off-Field DPS", "Off-Field Support"],
  Furina: ["Off-Field DPS", "Off-Field Support", "Off-Field Healer"],
  Bennett: ["Off-Field Support", "Off-Field Healer", "On-Field DPS"],
  "Sangonomiya Kokomi": ["Off-Field Healer", "Off-Field Support", "On-Field Healer"],
  "Kaedehara Kazuha": ["Off-Field Support", "Off-Field DPS"],
  Nahida: ["Off-Field DPS", "Off-Field Support", "On-Field DPS"],
  Yelan: ["Off-Field DPS", "Off-Field Support"],
  Xingqiu: ["Off-Field DPS", "Off-Field Support"],
  Xiangling: ["Off-Field DPS", "On-Field DPS"],
  Zhongli: ["Off-Field Support", "Off-Field DPS", "On-Field DPS"],
  Valeriy: ["Off-Field Support"],
  Mitya: ["On-Field DPS", "Off-Field DPS"],
  "Kamisato Ayaka": ["On-Field DPS", "Off-Field DPS"],
  "Kamisato Ayato": ["On-Field DPS", "Off-Field DPS"],
  Navia: ["On-Field DPS", "Off-Field DPS"],
  Ganyu: ["On-Field DPS", "Off-Field DPS"],
  Tighnari: ["On-Field DPS", "Off-Field DPS"],
  Tartaglia: ["On-Field DPS", "Off-Field DPS"],
  Mavuika: ["On-Field DPS", "Off-Field DPS", "Off-Field Support"],
  Nilou: ["Off-Field Support", "Off-Field DPS", "On-Field DPS"],

  // Dedicated Supports & Enablers
  Venti: ["Off-Field Support", "Off-Field DPS"],
  Sucrose: ["Off-Field Support", "On-Field Support"],
  Shenhe: ["Off-Field Support", "Off-Field DPS"],
  Xilonen: ["Off-Field Support", "Off-Field Healer", "On-Field DPS"],
  Citlali: ["Off-Field Support", "Off-Field DPS"],
  Albedo: ["Off-Field DPS", "Off-Field Support"],
  "Yae Miko": ["Off-Field DPS", "On-Field DPS"],
  Fischl: ["Off-Field DPS"],
  Emilie: ["Off-Field DPS"],
  Mona: ["Off-Field Support", "Off-Field DPS"],
  Chiori: ["Off-Field DPS"],
  Dehya: ["Off-Field Support", "Off-Field DPS", "On-Field DPS"],
  Faruzan: ["Off-Field Support", "Off-Field DPS"],
  "Yun Jin": ["Off-Field Support"],
  Gorou: ["Off-Field Support"],
  "Kujou Sara": ["Off-Field Support", "Off-Field DPS"],
  Chevreuse: ["Off-Field Support", "Off-Field Healer"],
  Kachina: ["Off-Field Support", "Off-Field DPS"],
  Ororon: ["Off-Field DPS", "Off-Field Support"],

  // Dedicated Healers & Sustainers
  Jean: ["Off-Field Healer", "Off-Field Support", "Off-Field DPS"],
  Baizhu: ["Off-Field Healer", "Off-Field Support"],
  Xianyun: ["Off-Field Healer", "On-Field Support", "On-Field DPS"],
  "Kuki Shinobu": ["Off-Field Healer", "Off-Field Support", "Off-Field DPS"],
  Yaoyao: ["Off-Field Healer", "Off-Field Support"],
  Barbara: ["Off-Field Healer", "Off-Field Support", "On-Field Healer"],
  Diona: ["Off-Field Healer", "Off-Field Support"],
  Charlotte: ["Off-Field Healer", "Off-Field Support"],
  Mika: ["Off-Field Healer", "Off-Field Support"],
  Sayu: ["Off-Field Healer", "Off-Field Support"],
  Dori: ["Off-Field Healer", "Off-Field Support"],
  Noelle: ["On-Field DPS", "On-Field Healer", "Off-Field Support"],

  // Flexible 4★ Units
  Rosaria: ["Off-Field DPS", "Off-Field Support"],
  Beidou: ["Off-Field DPS", "Off-Field Support"],
  Thoma: ["Off-Field Support", "Off-Field DPS"],
  Layla: ["Off-Field Support", "Off-Field DPS"],
  Kirara: ["Off-Field Support", "Off-Field DPS"],
  Collei: ["Off-Field DPS", "Off-Field Support"],
  Candace: ["Off-Field Support", "Off-Field DPS"],
  Kaveh: ["On-Field DPS", "Off-Field DPS"],
  "Shikanoin Heizou": ["On-Field DPS", "Off-Field DPS"],
  Freminet: ["On-Field DPS"],
  Traveler: ["Off-Field Support", "Off-Field DPS", "On-Field DPS"],
};

const HEALER_SETS = new Set([
  "Maiden Beloved",
  "Ocean-Hued Clam",
  "Song of Days Past",
]);

const SUPPORT_SETS = new Set([
  "Noblesse Oblige",
  "Viridescent Venerer",
  "Tenacity of the Millelith",
  "Deepwood Memories",
  "Scroll of the Hero of Tona",
  "Instructor",
  "The Exile",
  "A Day Carved from Rising Winds",
  "Heart of the Furnace",
]);

const SUB_DPS_SETS = new Set([
  "Golden Troupe",
  "Emblem of Severed Fate",
]);

const DPS_SETS = new Set([
  "Marechaussee Hunter",
  "Fragment of Harmonic Whimsy",
  "Gladiator's Finale",
  "Shimenawa's Reminiscence",
  "Crimson Witch of Flames",
  "Heart of Depth",
  "Blizzard Strayer",
  "Desert Pavilion Chronicle",
  "Nymph's Dream",
  "Vermillion Hereafter",
  "Echoes of an Offering",
  "Obsidian Codex",
]);

const UTILITY_WEAPONS = [
  "favonius",
  "sacrificial",
  "thrilling tales of dragon slayers",
  "freedom-sworn",
  "elegy for the end",
  "rightful reward",
  "dialogues of the desert sages",
  "prototype amber",
  "xiphos' moonlight",
];

export function getCharacterCombatRoles(
  characterName: string,
  avatarId?: number
): CombatRole[] {
  // 1. Check direct avatar ID match if available
  if (avatarId !== undefined) {
    const canonicalNameFromId = AVATAR_ID_TO_CANONICAL_NAME[avatarId];
    if (canonicalNameFromId && CHARACTER_COMBAT_ROLES[canonicalNameFromId]) {
      return [...CHARACTER_COMBAT_ROLES[canonicalNameFromId]];
    }
  }

  // 2. Check normalized name match
  const normalized = normalizeCharacterName(characterName);
  if (CHARACTER_COMBAT_ROLES[normalized]) {
    return [...CHARACTER_COMBAT_ROLES[normalized]];
  }

  // 3. Fallback search against catalog keys (case-insensitive)
  const lower = normalized.toLowerCase();
  for (const [key, roles] of Object.entries(CHARACTER_COMBAT_ROLES)) {
    if (key.toLowerCase() === lower) {
      return [...roles];
    }
  }

  // 4. Default fallback for unknown characters
  return ["On-Field DPS"];
}

export function getCharacterTypicalRoles(
  characterName: string,
  avatarId?: number
): CombatRole[] {
  return getCharacterCombatRoles(characterName, avatarId);
}

export function inferActiveCombatRole(character: ShowcaseCharacter): CombatRole {
  const eligibleRoles =
    character.roles && character.roles.length > 0
      ? character.roles
      : getCharacterCombatRoles(character.name, character.avatarId);

  // If character is strictly single-role, return that role directly
  if (eligibleRoles.length === 1) {
    return eligibleRoles[0];
  }

  const healingBonus = character.stats.healingBonus ?? 0;
  const artifactSetNames = character.artifactSets.map((s) => s.name);
  const weaponNameLower = (character.weapon?.name ?? "").toLowerCase();

  // 1. Check Healer roles:
  const hasHealerRole =
    eligibleRoles.includes("Off-Field Healer") ||
    eligibleRoles.includes("On-Field Healer") ||
    eligibleRoles.includes("Healer");

  if (hasHealerRole) {
    const hasHealerSet = artifactSetNames.some((name) => HEALER_SETS.has(name));
    if (healingBonus > 10 || hasHealerSet) {
      if (eligibleRoles.includes("Off-Field Healer")) return "Off-Field Healer";
      if (eligibleRoles.includes("On-Field Healer")) return "On-Field Healer";
      if (eligibleRoles.includes("Healer")) return "Healer";
    }
  }

  // 2. Check Support roles:
  const hasSupportRole =
    eligibleRoles.includes("Off-Field Support") ||
    eligibleRoles.includes("On-Field Support") ||
    eligibleRoles.includes("Support");

  if (hasSupportRole) {
    const hasSupportSet = artifactSetNames.some((name) => SUPPORT_SETS.has(name));
    const hasUtilityWeapon = UTILITY_WEAPONS.some((w) => weaponNameLower.includes(w));
    const isEmBattery = character.stats.em >= 800 && character.stats.critRate < 40;

    if (hasSupportSet || hasUtilityWeapon || isEmBattery) {
      if (eligibleRoles.includes("Off-Field Support")) return "Off-Field Support";
      if (eligibleRoles.includes("On-Field Support")) return "On-Field Support";
      if (eligibleRoles.includes("Support")) return "Support";
    }
  }

  // 3. Check Sub-DPS / Off-Field DPS:
  const hasSubDpsRole =
    eligibleRoles.includes("Off-Field DPS") || eligibleRoles.includes("Sub-DPS");

  if (hasSubDpsRole) {
    const hasSubDpsSet = artifactSetNames.some((name) => SUB_DPS_SETS.has(name));
    if (hasSubDpsSet && character.name !== "Raiden Shogun") {
      return eligibleRoles.includes("Off-Field DPS") ? "Off-Field DPS" : "Sub-DPS";
    }
    if (character.name === "Furina" && !healingBonus) {
      return eligibleRoles.includes("Off-Field DPS") ? "Off-Field DPS" : "Sub-DPS";
    }
  }

  // 4. Check On-Field DPS / DPS:
  const hasDpsRole =
    eligibleRoles.includes("On-Field DPS") || eligibleRoles.includes("DPS");

  if (hasDpsRole) {
    const hasDpsSet = artifactSetNames.some((name) => DPS_SETS.has(name));
    const isHighCritCarry =
      character.stats.critRate >= 50 &&
      character.stats.critDmg >= 120 &&
      character.totalCv >= 140;

    if (hasDpsSet || isHighCritCarry) {
      return eligibleRoles.includes("On-Field DPS") ? "On-Field DPS" : "DPS";
    }
  }

  // 5. Fallback: primary canonical role
  return eligibleRoles[0];
}

export function isRoleMatch(
  characterRole: CombatRole | undefined,
  filterRole: CombatRole | "All"
): boolean {
  if (!characterRole) return false;
  if (filterRole === "All") return true;
  if (characterRole === filterRole) return true;

  // Broad category matching:
  if (filterRole === "DPS") {
    return (
      characterRole === "On-Field DPS" ||
      characterRole === "Off-Field DPS" ||
      characterRole === "DPS"
    );
  }
  if (filterRole === "Sub-DPS") {
    return characterRole === "Off-Field DPS" || characterRole === "Sub-DPS";
  }
  if (filterRole === "Support") {
    return (
      characterRole === "Off-Field Support" ||
      characterRole === "On-Field Support" ||
      characterRole === "Support"
    );
  }
  if (filterRole === "Healer") {
    return (
      characterRole === "Off-Field Healer" ||
      characterRole === "On-Field Healer" ||
      characterRole === "Healer"
    );
  }

  // Matching broad tags against specific variants
  if (filterRole === "On-Field DPS" && characterRole === "DPS") return true;
  if (filterRole === "Off-Field DPS" && characterRole === "Sub-DPS") return true;
  if (filterRole === "Off-Field Support" && characterRole === "Support") return true;
  if (filterRole === "Off-Field Healer" && characterRole === "Healer") return true;

  return false;
}

export function getRoleBadgeClass(role?: CombatRole): string {
  switch (role) {
    case "On-Field DPS":
    case "DPS":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "Off-Field DPS":
    case "Sub-DPS":
      return "bg-sky-500/15 text-sky-300 border border-sky-500/30";
    case "Off-Field Support":
    case "Support":
      return "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30";
    case "On-Field Support":
      return "bg-violet-500/15 text-violet-300 border border-violet-500/30";
    case "Off-Field Healer":
    case "Healer":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "On-Field Healer":
      return "bg-teal-500/15 text-teal-300 border border-teal-500/30";
    default:
      return "bg-white/10 text-[#dfe2f1] border border-white/20";
  }
}
