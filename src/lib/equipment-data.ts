import type {
  BuildArchetype,
  CharacterEquipmentGuide,
  CombatRole,
  MainStatRecommendations,
  ShowcaseCharacter,
  WeaponRecommendation,
} from "@/types/genshin";

// Canonical Avatar ID mappings for robust identification across languages and showcase formats
export const CHARACTER_AVATAR_IDS: Record<number, string> = {
  10000109: "Valeriy",
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
};

// Authoritative Game8 Archive IDs paired directly with Character IDs and canonical names
export const GAME8_ARCHIVE_IDS: Record<number | string, string> = {
  // Keyed by Avatar ID
  10000108: "606906", // Mitya
  10000096: "382103", // Arlecchino
  10000089: "417212", // Furina
  10000087: "393054", // Neuvillette
  10000073: "383713", // Nahida
  10000047: "332826", // Kaedehara Kazuha
  10000052: "337161", // Raiden Shogun
  10000032: "297522", // Bennett
  10000060: "372781", // Yelan
  10000030: "305858", // Zhongli
  10000046: "314347", // Hu Tao
  10000023: "297530", // Xiangling
  10000015: "297531", // Xingqiu
  10000002: "337160", // Kamisato Ayaka
  10000066: "362947", // Kamisato Ayato
  10000078: "397395", // Alhaitham
  10000098: "461989", // Clorinde
  10000091: "436662", // Navia
  10000026: "313364", // Xiao
  10000075: "392067", // Wanderer
  10000037: "312241", // Ganyu
  10000042: "297525", // Keqing
  10000031: "297524", // Fischl
  10000016: "297523", // Diluc
  10000003: "297527", // Jean
  10000041: "297529", // Mona
  10000069: "383710", // Tighnari
  10000071: "383711", // Cyno
  10000070: "383712", // Nilou
  10000065: "372782", // Kuki Shinobu
  10000043: "297532", // Sucrose
  10000103: "461997", // Xilonen
  10000101: "461991", // Kinich
  10000102: "461994", // Mualani
  10000104: "462001", // Chasca
  10000107: "462002", // Citlali
  10000106: "462000", // Mavuika
  10000022: "297521", // Venti
  10000033: "305857", // Tartaglia
  10000038: "312240", // Albedo
  10000051: "330058", // Eula
  10000049: "337159", // Yoimiya
  10000058: "359005", // Yae Miko
  10000063: "359006", // Shenhe
  10000057: "349257", // Arataki Itto
  10000082: "383714", // Baizhu
  10000084: "393052", // Lyney
  10000086: "393053", // Wriothesley
  10000093: "446337", // Xianyun
  10000099: "461990", // Emilie
  10000079: "397396", // Dehya
  10000077: "397397", // Yaoyao
  // Also keyed by Character Name
  Mitya: "606906",
  Arlecchino: "382103",
  Furina: "417212",
  Neuvillette: "393054",
  Nahida: "383713",
  "Kaedehara Kazuha": "332826",
  Kazuha: "332826",
  "Raiden Shogun": "337161",
  Raiden: "337161",
  Bennett: "297522",
  Yelan: "372781",
  Zhongli: "305858",
  "Hu Tao": "314347",
  Xiangling: "297530",
  Xingqiu: "297531",
  "Kamisato Ayaka": "337160",
  Ayaka: "337160",
  "Kamisato Ayato": "362947",
  Ayato: "362947",
  Alhaitham: "397395",
  Clorinde: "461989",
  Navia: "436662",
  Xiao: "313364",
  Wanderer: "392067",
  Ganyu: "312241",
  Keqing: "297525",
  Fischl: "297524",
  Diluc: "297523",
  Jean: "297527",
  Mona: "297529",
  Tighnari: "383710",
  Cyno: "383711",
  Nilou: "383712",
  "Kuki Shinobu": "372782",
  Shinobu: "372782",
  Sucrose: "297532",
  Xilonen: "461997",
  Kinich: "461991",
  Mualani: "461994",
  Chasca: "462001",
  Citlali: "462002",
  Mavuika: "462000",
};

export const GAME8_CHARACTER_ARCHIVES: Record<string, string> = Object.fromEntries(
  Object.entries(GAME8_ARCHIVE_IDS).map(([key, archiveId]) => [
    key,
    `https://game8.co/games/Genshin-Impact/archives/${archiveId}`,
  ])
);

import {
  getCharacterCombatRoles,
  isRoleMatch,
  normalizeCharacterName,
} from "@/lib/character-roles";
export { normalizeCharacterName };

export function getCharacterSlug(name: string): string {
  const normalized = normalizeCharacterName(name);
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCharacterGuideLinks(
  target: ShowcaseCharacter | { avatarId?: number; name: string } | string | number
) {
  let name = "";
  let avatarId: number | undefined;

  if (typeof target === "object" && target !== null) {
    name = target.name;
    avatarId = Number(target.avatarId);
  } else if (typeof target === "number") {
    avatarId = target;
    name = CHARACTER_AVATAR_IDS[target] ?? `Character #${target}`;
  } else {
    name = target;
    const foundEntry = Object.entries(CHARACTER_AVATAR_IDS).find(
      ([, n]) => n.toLowerCase() === target.toLowerCase()
    );
    if (foundEntry) {
      avatarId = Number(foundEntry[0]);
    }
  }

  const normalized = normalizeCharacterName(name);
  const slug = getCharacterSlug(normalized);

  // 1. Prioritize paired Game8 Archive ID by numerical character avatarId
  const archiveId =
    (avatarId !== undefined ? GAME8_ARCHIVE_IDS[avatarId] : undefined) ??
    GAME8_ARCHIVE_IDS[normalized] ??
    GAME8_ARCHIVE_IDS[name];

  const game8Url = archiveId
    ? `https://game8.co/games/Genshin-Impact/archives/${archiveId}`
    : `https://game8.co/games/Genshin-Impact/search?q=${encodeURIComponent(
        normalized + " Best Builds"
      )}`;
  const icyVeinsUrl = `https://www.icy-veins.com/genshin-impact/${slug}-guide-best-builds`;
  const kqmUrl = `https://keqingmains.com/${slug}/`;
  const genshinGgUrl = `https://genshin.gg/characters/${slug}/`;

  return {
    game8Url,
    icyVeinsUrl,
    kqmUrl,
    genshinGgUrl,
  };
}

export const CURATED_EQUIPMENT_GUIDES: Record<string, CharacterEquipmentGuide> = {
  Arlecchino: {
    characterName: "Arlecchino",
    element: "Pyro",
    weaponType: "Polearm",
    role: "On-Field Pyro Hypercarry",
    overview:
      "Arlecchino is a premier Pyro DPS whose normal attacks infuse with Pyro when her Bond of Life is at or above 30%. Her signature weapon Crimson Moon's Semblance grants unique Bond of Life generation on Charged Attack, but accessible 4★ options like Deathmatch and high-refinement White Tassel deliver exceptional performance.",
    guideLinks: getCharacterGuideLinks("Arlecchino"),
    archetypes: [
      {
        id: "arlecchino-vape-hyper",
        name: "Vaporize / Hypercarry",
        role: "DPS",
        description:
          "High single-target DPS paired with Hydro off-field applicators (Yelan, Xingqiu, Furina) and an Anemo VV shredder or Bennett.",
        talentPriority: [
          "Normal Attack: Invitation to a Decapitation (Crown / Lv.10)",
          "Elemental Skill: All Extinguishing Delegation (Lv.8-9)",
          "Elemental Burst: Balemoon Rising (Lv.6-8)",
        ],
        bestWeapons: [
          {
            name: "Crimson Moon's Semblance",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "Grants 25% Max HP Bond of Life on CA hit, giving instant Masque infusion, plus a passive +36% DMG bonus when BoL >= 30%.",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "Primordial Jade Winged-Spear",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "High Base ATK (674), 22.1% CRIT Rate, and easily maintained ATK% / DMG% stacks throughout her field uptime.",
            sourceNote: "Standard & Weapon Banners",
          },
          {
            name: "Staff of Homa",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "Massive 66.2% CRIT DMG substat and passive flat ATK bonus based on Max HP.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Staff of the Scarlet Sands",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "Converts EM into flat ATK; top-tier choice when running EM Sands in Vaporize/Melt teams.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Deathmatch",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Provides 36.8% CRIT Rate and consistent +16-24% ATK bonus, significantly lowering artifact crit stat pressure.",
            sourceNote: "Battle Pass",
            refinementPriority: "High (R1 is already strong, R5 adds +32-48% ATK)",
          },
          {
            name: "Ballad of the Fjords",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "CRIT Rate substat with +120-240 EM when team contains at least 3 different elements (standard for Vape).",
            sourceNote: "Battle Pass",
          },
          {
            name: "White Tassel",
            rarity: 3,
            tier: "Best 4★ / F2P",
            reason:
              "Free chest drop in Liyue / Chasm. At R5, its passive grants a huge +48% Normal Attack DMG bonus, rivaling many 4★ weapons.",
            sourceNote: "F2P Liyue Chests (R5 Recommended)",
          },
        ],
        bestArtifactSets: [
          {
            name: "Fragment of Harmonic Whimsy",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: ATK +18% • 4pc: When the value of a Bond of Life increases or decreases, deal 18% increased DMG for 6s (max 3 stacks = 54% DMG).",
            reason:
              "Arlecchino's absolute best-in-slot artifact set, designed specifically around her continuous Bond of Life consumption.",
          },
          {
            name: "Gladiator's Finale",
            type: "Alternative",
            count: 4,
            bonusSummary:
              "2pc: ATK +18% • 4pc: Increases Normal Attack DMG by 35% for Polearm wielders.",
            reason:
              "Near-parity alternative (only ~4-7% behind Whimsy) that long-term players often already have high-CV pieces for from bosses and Strongbox.",
          },
          {
            name: "Crimson Witch of Flames",
            type: "Alternative",
            count: 4,
            bonusSummary:
              "2pc: Pyro DMG +15% • 4pc: Increases Vaporize/Melt reaction DMG by 15%.",
            reason: "Viable if already farmed with superior substats for Vaporize teams.",
          },
          {
            name: "2pc Whimsy / Gladiator + 2pc Crimson Witch / Gilded",
            type: "2-Piece Combo",
            count: 2,
            bonusSummary: "ATK +18% / Pyro DMG +15% / EM +80",
            reason:
              "Excellent flexible transitional setup while farming a competitive 4pc Whimsy set.",
          },
        ],
        mainStats: {
          sands: ["ATK%", "Elemental Mastery (Vape with high ATK)"],
          goblet: ["Pyro DMG Bonus", "ATK% (temporary if much higher CV)"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "75% - 85% CRIT Rate / 160% - 210%+ CRIT DMG",
          recommendedEr: "110% - 120% (Burst is emergency heal/reset)",
          keySubstats: ["CRIT Rate", "CRIT DMG", "ATK%", "Elemental Mastery"],
          targetNotes:
            "Aim for 2,100+ ATK (with Pyro Resonance/Bennett), 75%+ CR, and 80-120 EM in Vaporize teams. ER is not a priority because her Burst resets her rotation.",
        },
      },
      {
        id: "arlecchino-overload",
        name: "Chevreuse Overload",
        role: "DPS",
        description:
          "Paired with Chevreuse and Electro sub-DPS (Fischl, Yae Miko, Raiden) for continuous -40% Pyro/Electro RES shred.",
        talentPriority: [
          "Normal Attack: Invitation to a Decapitation (Crown)",
          "Elemental Skill: All Extinguishing Delegation",
          "Elemental Burst: Balemoon Rising",
        ],
        bestWeapons: [
          {
            name: "Crimson Moon's Semblance",
            rarity: 5,
            tier: "BiS (Signature)",
            reason: "Top performance across all team archetypes.",
          },
          {
            name: "Primordial Jade Winged-Spear",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "High base ATK and consistent stacking in sustained combos.",
          },
          {
            name: "Deathmatch",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "High CRIT Rate allows focus on pure ATK% and CRIT DMG rolls.",
            sourceNote: "Battle Pass",
          },
          {
            name: "White Tassel (R5)",
            rarity: 3,
            tier: "Best 4★ / F2P",
            reason: "+48% Normal Attack DMG works brilliantly without reaction scaling.",
          },
        ],
        bestArtifactSets: [
          {
            name: "Fragment of Harmonic Whimsy",
            type: "4-Piece",
            count: 4,
            bonusSummary: "Up to +54% All DMG on BoL shift.",
            reason: "Highest raw multiplier for non-reaction Pyro normal attacks.",
          },
          {
            name: "Gladiator's Finale",
            type: "Alternative",
            count: 4,
            bonusSummary: "+35% Normal Attack DMG.",
            reason: "Dependable unconditional normal attack bonus.",
          },
        ],
        mainStats: {
          sands: ["ATK%"],
          goblet: ["Pyro DMG Bonus"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "75%+ CRIT Rate / 160%+ CRIT DMG",
          recommendedEr: "105% - 115%",
          keySubstats: ["CRIT Rate", "CRIT DMG", "ATK%"],
          targetNotes:
            "Overload doesn't rely on EM for Arlecchino's personal scaling, so prioritize pure ATK% and Crit rolls over Elemental Mastery.",
        },
      },
    ],
  },

  Furina: {
    characterName: "Furina",
    element: "Hydro",
    weaponType: "Sword",
    role: "Off-Field Sub-DPS & Universal DMG Buffer",
    overview:
      "Furina is Fontaine's core support and sub-DPS. Her Elemental Skill deals continuous high Hydro damage off-field while consuming team HP, and her Burst provides an unrivaled team-wide DMG bonus as HP shifts. Golden Troupe 4pc is her defining artifact set, and meeting her ER breakpoint is the single most important build goal.",
    guideLinks: getCharacterGuideLinks("Furina"),
    archetypes: [
      {
        id: "furina-subdps-buffer",
        name: "Off-Field Sub-DPS & Fanfare Buffer",
        role: "Sub-DPS",
        description:
          "The standard and most versatile Furina build, optimizing both personal Salon Solitaire damage and full Burst uptime.",
        talentPriority: [
          "Elemental Burst: Let the People Rejoice (Crown / Lv.10)",
          "Elemental Skill: Salon Solitaire (Crown / Lv.10)",
          "Normal Attack: Soloist's Solicitation (Leave at Lv.1 unless C6)",
        ],
        bestWeapons: [
          {
            name: "Splendor of Tranquil Waters",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "Massive 88.2% CRIT DMG, +24% Skill DMG on party HP changes, and +28% Max HP.",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "Festering Desire",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "The best 4★ weapon: 45.9% ER with passive +32% Skill DMG and +12% Skill CRIT Rate (R5).",
            sourceNote: "Version 1.2 Event (Unobtainable if missed)",
          },
          {
            name: "Fleuve Cendre Ferryman",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Fontaine fishing weapon accessible to all players: 45.9% ER, +16% Skill CRIT Rate, and +32% ER for 5s after casting Skill.",
            sourceNote: "F2P Fontaine Fishing Association (R5 Recommended)",
          },
          {
            name: "Favonius Sword",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "High ER (61.3%) and generates 6 white energy particles on CRIT hit, dramatically easing energy requirements for both Furina and the entire party.",
            sourceNote: "Standard & Gacha",
          },
          {
            name: "Key of Khaj-Nisut",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "Huge 66.2% HP substat + converts Max HP into team EM; top tier for reaction-based teams.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Primordial Jade Cutter",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "44.1% CRIT Rate and +20% Max HP passive make stat balancing effortless.",
            sourceNote: "Weapon Banner",
          },
        ],
        bestArtifactSets: [
          {
            name: "Golden Troupe",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: Skill DMG +20% • 4pc: Skill DMG +25%. When off-field, Skill DMG is further increased by 25% (total +70% Skill DMG).",
            reason:
              "Furina's undisputed best-in-slot artifact set. Her summons deal virtually all their damage off-field.",
          },
          {
            name: "2pc Golden Troupe + 2pc Tenacity / Vourukasha / Emblem",
            type: "2-Piece Combo",
            count: 2,
            bonusSummary: "Skill DMG +20% and HP +20% or ER +20%",
            reason:
              "A viable placeholder until 4pc Golden Troupe with sufficient ER is farmed.",
          },
        ],
        mainStats: {
          sands: ["HP% (with ER weapon)", "Energy Recharge (with non-ER weapon / solo Hydro)"],
          goblet: ["HP% (very close to Hydro DMG due to Furina's massive A4 and Burst DMG% buffs)", "Hydro DMG Bonus"],
          circlet: ["CRIT Rate", "CRIT DMG", "HP% (early game)"],
        },
        benchmarks: {
          critRatio: "70% - 85% CRIT Rate / 140% - 190%+ CRIT DMG",
          recommendedEr:
            "160% - 180% (Double Hydro with Neuvillette/Yelan) / 200% - 220% (Solo Hydro)",
          keySubstats: ["Energy Recharge (until breakpoint)", "CRIT Rate", "CRIT DMG", "HP%"],
          targetNotes:
            "Reaching 38,000 - 40,000 HP maximizes her A4 talent (which caps at 40k HP). Always secure enough ER to burst every 18s before pushing CRIT.",
        },
      },
      {
        id: "furina-healer",
        name: "Singer of Many Waters Healer",
        role: "Healer",
        description:
          "Pneuma mode dedicated party sustainer prioritizing Max HP, Healing Bonus, and team survivability.",
        talentPriority: [
          "Elemental Skill: Salon Solitaire (Crown / Lv.10)",
          "Elemental Burst: Let the People Rejoice (Lv.8-9)",
          "Normal Attack (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Key of Khaj-Nisut",
            rarity: 5,
            tier: "BiS (Signature)",
            reason: "Massive 66.2% HP substat directly elevating healing output.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "The Dockhand's Assistant",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "41.3% HP substat boosting healing ticks.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Favonius Sword",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Generates party particles on CRIT to ensure Burst availability.",
            sourceNote: "Standard Gacha",
          },
        ],
        bestArtifactSets: [
          {
            name: "Maiden Beloved",
            type: "4-Piece",
            count: 4,
            bonusSummary: "Increases healing effectiveness by 15% and party healing received by 20% on Skill/Burst.",
            reason: "Maximizes Pneuma Singer of Many Waters healing per tick.",
          },
          {
            name: "Song of Days Past",
            type: "Alternative",
            count: 4,
            bonusSummary: "2pc: +15% Healing Bonus • 4pc: Converts healing volume into flat damage for active character.",
            reason: "Converts Furina's continuous single-target healing into team damage.",
          },
          {
            name: "Ocean-Hued Clam",
            type: "Alternative",
            count: 4,
            bonusSummary: "Converts healing into area physical damage procs.",
            reason: "Adds offensive value to Pneuma healing mode.",
          },
        ],
        mainStats: {
          sands: ["HP%", "Energy Recharge"],
          goblet: ["HP%"],
          circlet: ["Healing Bonus", "HP%"],
        },
        benchmarks: {
          critRatio: "30%+ CRIT Rate (if using Favonius)",
          recommendedEr: "160% - 180%",
          keySubstats: ["HP%", "Flat HP", "Energy Recharge"],
          targetNotes: "45,000+ HP with Healing Bonus circlet provides reliable 4,000 - 6,000+ HP recovery per pulse.",
        },
      },
      {
        id: "furina-support",
        name: "Universal Fanfare Buffer",
        role: "Support",
        description:
          "Support loadout emphasizing maximum Fanfare team DMG bonus and Tenacity attack buffs.",
        talentPriority: [
          "Elemental Burst: Let the People Rejoice (Crown / Lv.10)",
          "Elemental Skill: Salon Solitaire (Lv.9)",
          "Normal Attack (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Favonius Sword",
            rarity: 4,
            tier: "BiS (Signature)",
            reason: "Ensures 100% Burst uptime for continuous Fanfare stacking across all rotations.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Fleuve Cendre Ferryman",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "High ER and Skill CRIT Rate.",
            sourceNote: "Fontaine Fishing Association",
          },
        ],
        bestArtifactSets: [
          {
            name: "Tenacity of the Millelith",
            type: "4-Piece",
            count: 4,
            bonusSummary: "4pc: When Skill hits an opponent, ATK of all party members increases by 20% for 3s.",
            reason: "Furina's Salon members maintain 100% uptime on the Tenacity ATK buff.",
          },
          {
            name: "Golden Troupe",
            type: "Alternative",
            count: 4,
            bonusSummary: "+70% Skill DMG off-field.",
            reason: "Universal balance of support and personal damage.",
          },
        ],
        mainStats: {
          sands: ["Energy Recharge", "HP%"],
          goblet: ["HP%"],
          circlet: ["CRIT Rate", "HP%"],
        },
        benchmarks: {
          critRatio: "50%+ CRIT Rate / 100%+ CRIT DMG",
          recommendedEr: "180% - 200%+",
          keySubstats: ["Energy Recharge", "HP%", "CRIT Rate"],
          targetNotes: "Prioritize ER to guarantee burst cast on cooldown for unbroken Fanfare team damage buffs.",
        },
      },
    ],
  },

  Neuvillette: {
    characterName: "Neuvillette",
    element: "Hydro",
    weaponType: "Catalyst",
    role: "On-Field Hydro Hypercarry",
    overview:
      "The Iudex of Fontaine is one of Genshin's most dominant carries, firing continuous piercing Equitable Judgment torrents. His damage scales entirely off Max HP, and Marechaussee Hunter 4pc provides a staggering +36% CRIT Rate for trivial crit capping.",
    guideLinks: getCharacterGuideLinks("Neuvillette"),
    archetypes: [
      {
        id: "neuvillette-hypercarry",
        name: "Equitable Judgment Hypercarry",
        role: "DPS",
        description:
          "Solo or team-buffered continuous charged attack torrent. Trigger 3 distinct Hydro reactions to maximize his Past Draconic Glories A1 passive.",
        talentPriority: [
          "Normal Attack: As Water Seeks Equilibrium (Crown / Lv.10)",
          "Elemental Burst: O Tides, I Have Returned (Lv.9)",
          "Elemental Skill: O Tears, I Shall Repay (Lv.9)",
        ],
        bestWeapons: [
          {
            name: "Tome of the Eternal Flow",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "88.2% CRIT DMG, +16% Max HP, +42% Charged Attack DMG, and restores 8 Energy every 12s.",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "Sacrificial Jade",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "36.8% CRIT Rate and grants +32-64% Max HP and +40-80 EM when off-field for 5s. At R5 it competes directly with 5★ weapons.",
            sourceNote: "Battle Pass",
          },
          {
            name: "Prototype Amber",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Craftable F2P masterpiece: 41.3% HP substat, restores 18 Energy on Burst (R5), and heals the team to trigger Furina Fanfare stacks.",
            sourceNote: "Forge Craftable (R5 Recommended)",
          },
          {
            name: "Lost Prayer to the Sacred Winds",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "33.1% CRIT Rate and +8% Movement Speed / Elemental DMG stacks (be careful not to overcap CRIT with Marechaussee).",
            sourceNote: "Standard Banner",
          },
          {
            name: "Ash-Graven Drinking Horn",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Natlan event catalyst with 41.3% HP substat and AoE damage proc.",
            sourceNote: "Version 5.0 Event",
          },
        ],
        bestArtifactSets: [
          {
            name: "Marechaussee Hunter",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: Normal & Charged Attack DMG +15% • 4pc: When current HP increases or decreases, CRIT Rate is increased by 12% for 5s (max 3 stacks = 36% CRIT Rate).",
            reason:
              "Neuvillette's signature set. Since his CA drains HP and Sourcewater Droplets heal HP, 36% CRIT Rate is maintained 100% of the time.",
          },
          {
            name: "Heart of Depth",
            type: "Alternative",
            count: 4,
            bonusSummary: "Hydro DMG +15% • Charged Attack DMG +30% after Skill.",
            reason: "Solid alternative if you already have godly pieces.",
          },
        ],
        mainStats: {
          sands: ["HP%"],
          goblet: ["Hydro DMG Bonus", "HP% (especially when paired with Furina / Kazuha)"],
          circlet: ["CRIT DMG", "HP% (if substats have massive CRIT)"],
        },
        benchmarks: {
          critRatio: "50% - 64% CRIT Rate (becomes 86% - 100% with Marechaussee) / 220% - 280%+ CRIT DMG",
          recommendedEr: "120% - 130% (with Favonius teammate or Prototype Amber)",
          keySubstats: ["CRIT DMG", "HP%", "CRIT Rate (cap at 64%)", "Energy Recharge"],
          targetNotes:
            "Target 40,000+ HP. Never exceed 64% CRIT Rate on the character sheet with 4pc Marechaussee Hunter, as any CR above 64% is completely wasted.",
        },
      },
    ],
  },

  Nahida: {
    characterName: "Nahida",
    element: "Dendro",
    weaponType: "Catalyst",
    role: "Off-Field Dendro Enabler & EM Buffer",
    overview:
      "The Dendro Archon provides unrivaled 1.5U Tri-Karma Dendro application and shares up to 250 Elemental Mastery to the on-field character. Deepwood Memories 4pc is her default set to shred 30% Dendro RES for all Bloom/Hyperbloom/Burgeon and Quicken teams.",
    guideLinks: getCharacterGuideLinks("Nahida"),
    archetypes: [
      {
        id: "nahida-support",
        name: "Off-Field Tri-Karma Support",
        description:
          "The ubiquitous Dendro support build providing constant AoE Dendro application, RES shred, and party EM sharing.",
        talentPriority: [
          "Elemental Skill: All Schemes to Know (Crown / Lv.10)",
          "Elemental Burst: Illusory Heart (Lv.9)",
          "Normal Attack: Akara (Lv.1 unless on-field driver)",
        ],
        bestWeapons: [
          {
            name: "A Thousand Floating Dreams",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "Huge 265 EM substat, +32 EM / +10% DMG buffs, and shares +40 EM to the entire team.",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "Wandering Evenstar",
            rarity: 4,
            tier: "Top Alternative (5★)",
            reason:
              "165 EM and converts Nahida's EM into flat ATK for both herself and nearby party members.",
            sourceNote: "Gacha 4★",
          },
          {
            name: "Sacrificial Fragments",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "221 EM substat, the second-highest EM catalyst in the game.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Magic Guide",
            rarity: 3,
            tier: "Best 4★ / F2P",
            reason:
              "Incredible 3★ F2P option: 187 EM and +24% DMG against opponents affected by Hydro or Electro (R5).",
            sourceNote: "Common 3★ Gacha Pull",
          },
          {
            name: "The Widsith",
            rarity: 4,
            tier: "Top Alternative (5★)",
            reason: "High CRIT DMG and explosive 10s buffs; ideal for Spread sub-DPS.",
            sourceNote: "Standard Gacha",
          },
        ],
        bestArtifactSets: [
          {
            name: "Deepwood Memories",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: Dendro DMG +15% • 4pc: Decreases opponent Dendro RES by 30% for 8s after Skill or Burst hits (triggers off-field).",
            reason:
              "Mandatory team set unless another party member (e.g. Baizhu, Zhongli, Kuki) is already holding it.",
          },
          {
            name: "Gilded Dreams",
            type: "Alternative",
            count: 4,
            bonusSummary:
              "2pc: EM +80 • 4pc: Grants up to +150 EM or +42% ATK based on party element diversity.",
            reason:
              "Best for personal damage if a teammate already carries 4pc Deepwood Memories.",
          },
        ],
        mainStats: {
          sands: ["Elemental Mastery"],
          goblet: ["Elemental Mastery (off-field)", "Dendro DMG Bonus (if EM already 800+)"],
          circlet: ["Elemental Mastery (until 800-1000 EM)", "CRIT Rate / CRIT DMG"],
        },
        benchmarks: {
          critRatio: "50% - 60% CRIT Rate / 120% - 150% CRIT DMG",
          recommendedEr: "120% - 135% (Burst costs only 50 energy)",
          keySubstats: ["Elemental Mastery", "CRIT Rate", "CRIT DMG", "Energy Recharge"],
          targetNotes:
            "Aim for 800 - 1,000 EM. Her A4 passive converts EM into up to +24% CRIT Rate and +80% DMG for Tri-Karma Purification, capping at exactly 1,000 EM.",
        },
      },
    ],
  },

  "Kaedehara Kazuha": {
    characterName: "Kaedehara Kazuha",
    element: "Anemo",
    weaponType: "Sword",
    role: "Anemo Buffer & Crowd Control Specialist",
    overview:
      "Kazuha is the gold standard for elemental amplification. Through 4pc Viridescent Venerer, he shreds 40% elemental RES, while his Poetics of Fuubutsu passive grants 0.04% Elemental DMG bonus per point of EM to every party member for Swirled elements (e.g., 40% DMG at 1,000 EM).",
    guideLinks: getCharacterGuideLinks("Kaedehara Kazuha"),
    archetypes: [
      {
        id: "kazuha-swirl-buffer",
        name: "Full EM Swirl & Team Buffer",
        description:
          "Triple Elemental Mastery build maximizing team damage amplification, grouping, and continuous elemental infusion.",
        talentPriority: [
          "Elemental Burst: Kazuha Slash (Lv.8-9)",
          "Elemental Skill: Chihayaburu (Lv.8-9)",
          "Normal Attack: Garyuu Bladework (Lv.6)",
        ],
        bestWeapons: [
          {
            name: "Freedom-Sworn",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "198 EM, +10% DMG, and triggers Millennial Movement granting the whole team +20% ATK and +16% Normal/Charged/Plunging Attack DMG.",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "Xiphos' Moonlight",
            rarity: 4,
            tier: "Top Alternative (5★)",
            reason:
              "165 EM and converts Kazuha's EM into personal ER (up to ~36-72% ER) while sharing 30% of that ER to all teammates.",
            sourceNote: "Limited 4★ Gacha",
          },
          {
            name: "Iron Sting",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Craftable 4★ F2P sword with 165 EM. Accessible immediately to all accounts.",
            sourceNote: "Forge Craftable",
          },
          {
            name: "Favonius Sword",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Provides 61.3% ER and clear energy particles; top pick whenever your team struggles with burst rotations.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Toukabou Shigure",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Event 4★ umbrella sword with 165 EM.",
            sourceNote: "Version 3.3 Event",
          },
        ],
        bestArtifactSets: [
          {
            name: "Viridescent Venerer",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: Anemo DMG +15% • 4pc: Increases Swirl DMG by 60%. Decreases opponent's Elemental RES to the element infused in the Swirl by 40% for 10s.",
            reason:
              "Essential. Non-negotiable best-in-slot that provides the massive -40% RES shred.",
          },
        ],
        mainStats: {
          sands: ["Elemental Mastery", "Energy Recharge (if lacking ER substats)"],
          goblet: ["Elemental Mastery"],
          circlet: ["Elemental Mastery"],
        },
        benchmarks: {
          critRatio: "Optional (Swirl scales purely off character level and EM)",
          recommendedEr: "160% - 180% (140% with Favonius or Xiphos)",
          keySubstats: ["Energy Recharge (until 160%+)", "Elemental Mastery", "CRIT Rate (for Favonius proc)"],
          targetNotes:
            "Level 90 is mandatory because Swirl transformative reaction damage scales exponentially with character level. Target 950 - 1,000+ EM.",
        },
      },
    ],
  },

  "Raiden Shogun": {
    characterName: "Raiden Shogun",
    element: "Electro",
    weaponType: "Polearm",
    role: "Burst DPS & Universal Team Battery",
    overview:
      "The Electro Archon acts as a team battery, buffing team burst damage with her Skill and unleashing devastating slashes during her Musou Isshin burst stance. Her kit revolves around Energy Recharge, converting it directly into Electro DMG and party energy restoration.",
    guideLinks: getCharacterGuideLinks("Raiden Shogun"),
    archetypes: [
      {
        id: "raiden-burst-dps",
        name: "Emblem Burst DPS / Battery",
        role: "DPS",
        description:
          "Traditional Hypercarry or Rational DPS build converting Energy Recharge into massive burst multipliers via Emblem 4pc.",
        talentPriority: [
          "Elemental Burst: Secret Art: Musou Shinsetsu (Crown / Lv.10)",
          "Elemental Skill: Transcendence: Baleful Omen (Lv.9)",
          "Normal Attack: Origin (Leave at Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Engulfing Lightning",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "55.1% ER, converts ER above 100% into ATK% (up to 80%), and grants +30-50% ER after casting Burst.",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "The Catch",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "One of the best free weapons in Genshin history: 45.9% ER, +32% Burst DMG, and +12% Burst CRIT Rate at R5 from Inazuma fishing.",
            sourceNote: "F2P Inazuma Fishing (R5 Recommended)",
          },
          {
            name: "Staff of Homa",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "66.2% CRIT DMG and unconditional ATK bonus.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Skyward Spine",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "674 Base ATK, 36.8% ER, and 8% CRIT Rate + Attack Speed.",
            sourceNote: "Standard Banner",
          },
          {
            name: "Wavebreaker's Fin",
            rarity: 4,
            tier: "Top Alternative (5★)",
            reason:
              "Highest 4★ base ATK (620) and buffs Burst DMG based on combined party energy capacity.",
            sourceNote: "Weapon Banner Gacha",
          },
        ],
        bestArtifactSets: [
          {
            name: "Emblem of Severed Fate",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: ER +20% • 4pc: Increases Elemental Burst DMG by 25% of Energy Recharge (max 75% bonus).",
            reason:
              "Flawlessly tailored to Raiden's kit, granting maximum burst damage from her high ER investment.",
          },
        ],
        mainStats: {
          sands: ["Energy Recharge", "ATK% (with The Catch / Engulfing Lightning)"],
          goblet: ["Electro DMG Bonus", "ATK% (if running ER Sands without Bennett)"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "60% - 70% CRIT Rate / 130% - 160%+ CRIT DMG",
          recommendedEr: "250% - 270% (Engulfing) / 220% - 240% (The Catch)",
          keySubstats: ["CRIT Rate", "CRIT DMG", "Energy Recharge", "ATK%"],
          targetNotes:
            "Maintain at least 220% ER so she can fully restore 20-25 flat energy to all three teammates during her 7s burst window.",
        },
      },
      {
        id: "raiden-hyperbloom",
        name: "Hyperbloom Electro Trigger",
        role: "Support",
        description:
          "Full Elemental Mastery build using her 0.9s coordinated Skill proc to trigger homing Hyperbloom Dendro cores.",
        talentPriority: [
          "Elemental Skill: Transcendence (Lv.1-6, talent level does not affect Hyperbloom DMG)",
          "Character Level: Lv.90 is mandatory",
        ],
        bestWeapons: [
          {
            name: "Dragon's Bane",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "221 EM substat, highest EM polearm.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Moonpiercer",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Craftable Sumeru polearm with 110 EM and Leaf of Revival ATK buff.",
            sourceNote: "Forge Craftable",
          },
        ],
        bestArtifactSets: [
          {
            name: "Flower of Paradise Lost",
            type: "4-Piece",
            count: 4,
            bonusSummary: "Increases Hyperbloom reaction DMG by up to 140%.",
            reason: "Maximum Hyperbloom reaction ceiling.",
          },
          {
            name: "Gilded Dreams",
            type: "Alternative",
            count: 4,
            bonusSummary: "Grants up to +230 EM.",
            reason: "More resin-efficient domain shared with Deepwood Memories.",
          },
        ],
        mainStats: {
          sands: ["Elemental Mastery"],
          goblet: ["Elemental Mastery"],
          circlet: ["Elemental Mastery"],
        },
        benchmarks: {
          critRatio: "Not needed (Hyperbloom cannot crit without Nahida C2)",
          recommendedEr: "100% (Never casts Burst in Hyperbloom)",
          keySubstats: ["Elemental Mastery"],
          targetNotes:
            "Level 90 is mandatory. Reach 900 - 1,000+ EM to deal 30,000 - 36,000+ damage per Hyperbloom core.",
        },
      },
      {
        id: "raiden-subdps",
        name: "Emblem Off-Field Battery & Sub-DPS",
        role: "Sub-DPS",
        description:
          "Off-field skill damage and team burst energy restoration setup optimized for quickswap and dual-carry teams.",
        talentPriority: [
          "Elemental Burst: Secret Art: Musou Shinsetsu (Lv.9-10)",
          "Elemental Skill: Transcendence: Baleful Omen (Lv.9)",
          "Normal Attack: Origin (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "The Catch",
            rarity: 4,
            tier: "BiS (Signature)",
            reason: "45.9% ER, +32% Burst DMG, and +12% Burst CRIT Rate at R5.",
            sourceNote: "F2P Inazuma Fishing",
          },
          {
            name: "Favonius Lance",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Maximizes energy particle generation for high-cost teammate bursts.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Engulfing Lightning",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "Premier ER-to-ATK conversion.",
            sourceNote: "Limited Weapon Banner",
          },
        ],
        bestArtifactSets: [
          {
            name: "Emblem of Severed Fate",
            type: "4-Piece",
            count: 4,
            bonusSummary: "2pc: ER +20% • 4pc: Increases Burst DMG by 25% of ER.",
            reason: "Ideal scaling for burst damage and team energy restoration.",
          },
        ],
        mainStats: {
          sands: ["Energy Recharge"],
          goblet: ["Electro DMG Bonus", "ATK%"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "60%+ CRIT Rate / 120%+ CRIT DMG",
          recommendedEr: "230% - 260%",
          keySubstats: ["CRIT Rate", "CRIT DMG", "Energy Recharge", "ATK%"],
          targetNotes: "Ensure at least 230% ER for smooth full-team energy recharging.",
        },
      },
    ],
  },

  Bennett: {
    characterName: "Bennett",
    element: "Pyro",
    weaponType: "Sword",
    role: "ATK Buffer & Emergency Healer",
    overview:
      "Teyvat's premier universal support. Fantastic Voyage provides a monumental flat ATK buff that scales purely off Bennett's Base ATK (character level + weapon base ATK) and heals characters up to 70% HP at astonishing speed.",
    guideLinks: getCharacterGuideLinks("Bennett"),
    archetypes: [
      {
        id: "bennett-buffer-healer",
        name: "Fantastic Voyage ATK Buffer & Healer",
        role: "Support",
        description:
          "The standard Noblesse 4pc support build maximizing Base ATK contribution and 100% Burst uptime on cooldown.",
        talentPriority: [
          "Elemental Burst: Fantastic Voyage (Crown / Lv.10)",
          "Elemental Skill: Passion Overload (Lv.6-8)",
          "Normal Attack: Strike of Fortune (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Aquila Favonia",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "Highest possible Base ATK on a sword (674), granting the maximum possible ATK buff to your team.",
            sourceNote: "Standard Banner",
          },
          {
            name: "Mistsplitter Reforged",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "Tied for highest Base ATK (674) with Aquila.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Skyward Blade",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "608 Base ATK plus 55.1% Energy Recharge, solving all energy issues instantly.",
            sourceNote: "Standard Banner",
          },
          {
            name: "Sapwood Blade",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Best craftable F2P sword: high 565 Base ATK, 30.6% ER, and Leaf of Consciousness buff.",
            sourceNote: "Forge Craftable (Sumeru)",
          },
          {
            name: "The Alley Flash",
            rarity: 4,
            tier: "Top Alternative (5★)",
            reason: "Highest 4★ base ATK in the game (620).",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Favonius Sword",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Lower base ATK (454) but 61.3% ER and particle generation makes energy management effortless.",
            sourceNote: "Standard Gacha",
          },
        ],
        bestArtifactSets: [
          {
            name: "Noblesse Oblige",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: Burst DMG +20% • 4pc: Using an Elemental Burst increases all party members' ATK by 20% for 12s (cannot stack).",
            reason:
              "Bennett's mandatory set, stacking +20% team ATK on top of his Fantastic Voyage inspiration field.",
          },
          {
            name: "Instructor",
            type: "Alternative",
            count: 4,
            bonusSummary: "4pc: +120 EM to all party members for 8s after triggering an elemental reaction.",
            reason: "Top-tier 4★ artifact alternative for Vaporize/Melt teams.",
          },
        ],
        mainStats: {
          sands: ["Energy Recharge"],
          goblet: ["HP%", "Pyro DMG Bonus (for sub-DPS hybrid)"],
          circlet: ["Healing Bonus", "HP%", "CRIT Rate (if using Favonius Sword)"],
        },
        benchmarks: {
          critRatio: "Not prioritized unless running Favonius Sword (30%+ CR)",
          recommendedEr: "220% - 250%+ (Bennett must burst every single rotation)",
          keySubstats: ["Energy Recharge", "HP%", "Flat HP"],
          targetNotes:
            "ATK% artifact substats DO NOT increase Bennett's burst buff! Only his character base ATK and weapon base ATK count. Prioritize ER and HP%.",
        },
      },
      {
        id: "bennett-healer",
        name: "Dedicated Burst Healer & Sustain",
        role: "Healer",
        description:
          "High HP and Healing Bonus configuration maximizing tick healing for Furina teams and high-damage abyss floors.",
        talentPriority: [
          "Elemental Burst: Fantastic Voyage (Crown / Lv.10)",
          "Elemental Skill: Passion Overload (Lv.6)",
          "Normal Attack (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Skyward Blade",
            rarity: 5,
            tier: "BiS (Signature)",
            reason: "High base ATK and 55.1% ER ensuring 100% healing burst uptime.",
            sourceNote: "Standard Banner",
          },
          {
            name: "Favonius Sword",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "61.3% ER and generates party particles on CRIT.",
            sourceNote: "Standard Gacha",
          },
        ],
        bestArtifactSets: [
          {
            name: "Maiden Beloved",
            type: "4-Piece",
            count: 4,
            bonusSummary: "Increases healing effectiveness by 15% and party healing received by 20% for 10s after Burst.",
            reason: "Maximizes healing tick volume.",
          },
          {
            name: "Song of Days Past",
            type: "Alternative",
            count: 4,
            bonusSummary: "Converts excess healing into flat damage buffs for active character.",
            reason: "Converts Bennett's massive healing rate into team damage.",
          },
          {
            name: "Noblesse Oblige",
            type: "Alternative",
            count: 4,
            bonusSummary: "4pc: +20% Team ATK on Burst.",
            reason: "Standard buffer option with HP/Healing main stats.",
          },
        ],
        mainStats: {
          sands: ["Energy Recharge", "HP%"],
          goblet: ["HP%"],
          circlet: ["Healing Bonus", "HP%"],
        },
        benchmarks: {
          critRatio: "30% - 50% CRIT Rate (if using Favonius)",
          recommendedEr: "220% - 250%+",
          keySubstats: ["Energy Recharge", "HP%", "Flat HP", "CRIT Rate"],
          targetNotes: "30,000+ HP with 220%+ ER and Healing Bonus circlet heals 6,000 - 8,000+ HP per second.",
        },
      },
      {
        id: "bennett-dps",
        name: "Melt / Vaporize Carry",
        role: "DPS",
        description:
          "On-field Pyro carry capitalizing on his rapid Skill cooldown inside Fantastic Voyage with Chongyun or Xingqiu.",
        talentPriority: [
          "Elemental Skill: Passion Overload (Lv.9-10)",
          "Elemental Burst: Fantastic Voyage (Crown / Lv.10)",
          "Normal Attack: Strike of Fortune (Lv.8-9)",
        ],
        bestWeapons: [
          {
            name: "Mistsplitter Reforged",
            rarity: 5,
            tier: "BiS (Signature)",
            reason: "674 Base ATK, 44.1% CRIT DMG, and elemental DMG bonus stacks.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Primordial Jade Cutter",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "44.1% CRIT Rate and flat ATK scaling off Max HP.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "The Alley Flash",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Highest 4★ Base ATK (620) plus +12-24% universal DMG bonus.",
            sourceNote: "Weapon Banner Gacha",
          },
        ],
        bestArtifactSets: [
          {
            name: "Crimson Witch of Flames",
            type: "4-Piece",
            count: 4,
            bonusSummary: "2pc: Pyro DMG +15% • 4pc: Increases Melt/Vaporize DMG by 15% and Skill stacks Pyro DMG.",
            reason: "Ideal scaling for Bennett's continuous 2-second cooldown Skill spam.",
          },
        ],
        mainStats: {
          sands: ["ATK%", "Elemental Mastery"],
          goblet: ["Pyro DMG Bonus"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "65%+ CRIT Rate / 140%+ CRIT DMG",
          recommendedEr: "160% - 180%",
          keySubstats: ["CRIT Rate", "CRIT DMG", "Elemental Mastery", "Energy Recharge"],
          targetNotes: "Trigger reverse-Melt on every Skill cast for massive 50,000+ damage strikes.",
        },
      },
    ],
  },

  Yelan: {
    characterName: "Yelan",
    element: "Hydro",
    weaponType: "Bow",
    role: "Off-Field Hydro Sub-DPS & DMG Amplifier",
    overview:
      "Yelan excels as a high-damage off-field Hydro sub-DPS with rapid hydro application and an ascending team damage buff (+1% to +50% over 15s). All of her damage scales strictly from Max HP.",
    guideLinks: getCharacterGuideLinks("Yelan"),
    archetypes: [
      {
        id: "yelan-subdps",
        name: "Exquisite Throw Sub-DPS",
        description:
          "Off-field Hydro application and ramping damage amplification for on-field carries (Hu Tao, Arlecchino, Raiden, Yoimiya).",
        talentPriority: [
          "Elemental Burst: Depth-Clarion Dice (Crown / Lv.10)",
          "Elemental Skill: Lingering Lifeline (Lv.9)",
          "Normal Attack: Stealthy Bowshot (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Aqua Simulacra",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "88.2% CRIT DMG, +16% Max HP, and +20% DMG dealt when enemies are nearby (active off-field).",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "Favonius Warbow",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "61.3% ER and energy particle generation. Often outperforms 5★ weapons at C0 by allowing HP% Sands and smooth team rotations.",
            sourceNote: "Free Mondstadt Archon Quest & Gacha",
          },
          {
            name: "Elegy for the End",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "55.1% ER and team-wide +100 EM and +20% ATK buff; ideal in Vaporize and Quicken teams.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Sacrificial Bow",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Resets Skill for double sprint and particle generation.",
            sourceNote: "Standard Gacha",
          },
        ],
        bestArtifactSets: [
          {
            name: "Emblem of Severed Fate",
            type: "4-Piece",
            count: 4,
            bonusSummary: "ER +20% • Elemental Burst DMG +25% of ER (up to 75%).",
            reason: "Her strongest set by far, transforming high ER requirements into pure damage.",
          },
        ],
        mainStats: {
          sands: ["HP% (with Favonius Warbow)", "Energy Recharge (with Aqua Simulacra / C0 solo Hydro)"],
          goblet: ["Hydro DMG Bonus", "HP% (close alternative)"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "70% - 85% CRIT Rate / 140% - 200%+ CRIT DMG",
          recommendedEr: "170% - 190% (with Favonius / Double Hydro) / 210% - 230% (Solo Hydro C0)",
          keySubstats: ["Energy Recharge (to target)", "CRIT Rate", "CRIT DMG", "HP%"],
          targetNotes:
            "Target 32,000 - 36,000+ HP. Like Furina, her ATK stat is completely irrelevant—do not run ATK% pieces.",
        },
      },
    ],
  },

  Zhongli: {
    characterName: "Zhongli",
    element: "Geo",
    weaponType: "Polearm",
    role: "Indestructible Shielder & Universal RES Shredder",
    overview:
      "The Geo Archon grants the game's strongest shield, absorbing massive incoming damage while shredding 20% of all nearby enemies' Elemental and Physical RES.",
    guideLinks: getCharacterGuideLinks("Zhongli"),
    archetypes: [
      {
        id: "zhongli-shield-bot",
        name: "Indestructible Shield Bot",
        description:
          "Pure HP stacking build prioritizing maximum shield absorption, constant Tenacity of the Millelith team ATK buffs, and effortless survivability.",
        talentPriority: [
          "Elemental Skill: Dominance of Earth (Crown / Lv.10)",
          "Elemental Burst: Planet Befall (Lv.8)",
          "Normal Attack: Rain of Stone (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Black Tassel",
            rarity: 3,
            tier: "Best 4★ / F2P",
            reason: "46.9% HP substat, the highest HP% of any polearm in the game.",
            sourceNote: "Common 3★ Gacha Pull",
          },
          {
            name: "Favonius Lance",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Provides white energy particles for teammates when landing a CRIT hit.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Staff of Homa",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "+20% Max HP passive and high CRIT DMG for hybrid shield & meteor damage.",
            sourceNote: "Limited Weapon Banner",
          },
        ],
        bestArtifactSets: [
          {
            name: "Tenacity of the Millelith",
            type: "4-Piece",
            count: 4,
            bonusSummary: "HP +20% • +20% ATK and +30% Shield Strength to team on Skill hit.",
            reason: "Primary set that keeps stele pulses actively buffing team attack.",
          },
          {
            name: "2pc Tenacity + 2pc Vourukasha's Glow",
            type: "2-Piece Combo",
            count: 2,
            bonusSummary: "HP +40% combined",
            reason: "Maximum HP stacking for an unbreachable shield.",
          },
        ],
        mainStats: {
          sands: ["HP%"],
          goblet: ["HP%"],
          circlet: ["HP%", "CRIT Rate (with Favonius Lance)"],
        },
        benchmarks: {
          critRatio: "30%+ CRIT Rate (if using Favonius) / Otherwise not required",
          recommendedEr: "120% - 130%",
          keySubstats: ["HP%", "Flat HP", "Energy Recharge"],
          targetNotes:
            "Aim for 45,000 - 55,000+ Max HP. At this threshold, his Jade Shield absorbs virtually all boss attacks in Spiral Abyss.",
        },
      },
    ],
  },

  "Hu Tao": {
    characterName: "Hu Tao",
    element: "Pyro",
    weaponType: "Polearm",
    role: "On-Field Pyro Vaporize Carry",
    overview:
      "Hu Tao converts her Max HP into flat ATK during Guide to Afterlife, unleashing devastating Vaporize charged attacks with no internal cooldown.",
    guideLinks: getCharacterGuideLinks("Hu Tao"),
    archetypes: [
      {
        id: "hutao-vape",
        name: "Guide to Afterlife Vaporize Carry",
        description:
          "High single-target charged attack damage paired with Hydro appliers (Xingqiu, Yelan, Furina) and a shielder.",
        talentPriority: [
          "Normal Attack: Secret Spear of Wangsheng (Crown / Lv.10)",
          "Elemental Skill: Guide to Afterlife (Crown / Lv.10)",
          "Elemental Burst: Spirit Soother (Lv.8-9)",
        ],
        bestWeapons: [
          {
            name: "Staff of Homa",
            rarity: 5,
            tier: "BiS (Signature)",
            reason: "66.2% CRIT DMG, +20% Max HP, and massive flat ATK when below 50% HP.",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "Staff of the Scarlet Sands",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "44.1% CRIT Rate and converts EM directly into flat ATK.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Ballad of the Fjords",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "27.6% CRIT Rate and +120-240 EM in standard multi-element teams.",
            sourceNote: "Battle Pass",
          },
          {
            name: "Dragon's Bane",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "221 EM and +20-36% DMG against Hydro-affected targets.",
            sourceNote: "Standard Gacha (R5 Recommended)",
          },
          {
            name: "White Tassel (R5)",
            rarity: 3,
            tier: "Best 4★ / F2P",
            reason: "23.4% CRIT Rate and +48% Normal Attack DMG.",
            sourceNote: "Liyue Chests",
          },
        ],
        bestArtifactSets: [
          {
            name: "Crimson Witch of Flames",
            type: "4-Piece",
            count: 4,
            bonusSummary: "Pyro DMG +15% • Vaporize/Melt reaction DMG +15%.",
            reason: "Her classic best set, buffing both charged attacks and burst nukes.",
          },
          {
            name: "Marechaussee Hunter",
            type: "4-Piece",
            count: 4,
            bonusSummary: "+36% CRIT Rate on HP shifts.",
            reason: "Her absolute strongest set when paired with Furina.",
          },
          {
            name: "Shimenawa's Reminiscence",
            type: "Alternative",
            count: 4,
            bonusSummary: "Consumes 15 energy for +50% Normal/Charged Attack DMG for 10s.",
            reason: "Exceptional charged attack damage if bursting is not required.",
          },
        ],
        mainStats: {
          sands: ["HP%", "Elemental Mastery (with Staff of Homa)"],
          goblet: ["Pyro DMG Bonus"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "70% - 80% CRIT Rate / 180% - 220%+ CRIT DMG",
          recommendedEr: "100% - 115%",
          keySubstats: ["CRIT Rate", "CRIT DMG", "Elemental Mastery (aim for 150-250)", "HP%"],
          targetNotes:
            "Maintain 30,000 - 34,000+ HP and at least 150 EM for Vaporize reactions. ATK% substats are inefficient compared to HP% and EM.",
        },
      },
    ],
  },

  Xiangling: {
    characterName: "Xiangling",
    element: "Pyro",
    weaponType: "Polearm",
    role: "Off-Field Pyro Nuke & Pyronado Sub-DPS",
    overview:
      "Xiangling is one of the strongest sub-DPS characters in Genshin. Pyronado has no ICD, snapshots Bennett's ATK buff, and vaporizes on every single rotation.",
    guideLinks: getCharacterGuideLinks("Xiangling"),
    archetypes: [
      {
        id: "xiangling-pyronado",
        name: "Pyronado Off-Field Sub-DPS",
        description:
          "High-damage off-field Pyro applicator and reaction nuke powered by Emblem 4pc and Bennett battery funneling.",
        talentPriority: [
          "Elemental Burst: Pyronado (Crown / Lv.10)",
          "Elemental Skill: Guoba Attack (Lv.8-9)",
          "Normal Attack: Dough-Fu (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "The Catch",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "The gold standard F2P weapon: 45.9% ER, +32% Burst DMG, and +12% Burst CRIT Rate (R5) from Inazuma fishing.",
            sourceNote: "F2P Inazuma Fishing (R5)",
          },
          {
            name: "Staff of the Scarlet Sands",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "44.1% CRIT Rate and converts EM into ATK.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Staff of Homa",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "66.2% CRIT DMG and passive ATK bonus.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Dragon's Bane",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "221 EM and +36% DMG against Hydro targets in Vaporize teams.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Favonius Lance",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "High ER (30.6%) and team particle generation for energy-heavy rotations.",
            sourceNote: "Standard Gacha",
          },
        ],
        bestArtifactSets: [
          {
            name: "Emblem of Severed Fate",
            type: "4-Piece",
            count: 4,
            bonusSummary: "ER +20% • Burst DMG +25% of ER (up to 75%).",
            reason: "Her non-negotiable best set, turning high ER into colossal Pyronado hits.",
          },
        ],
        mainStats: {
          sands: ["Energy Recharge (with non-ER weapon)", "Elemental Mastery / ATK% (with The Catch)"],
          goblet: ["Pyro DMG Bonus"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "65% - 75% CRIT Rate / 130% - 160%+ CRIT DMG",
          recommendedEr: "180% - 210% (with Bennett) / 230%+ (without Bennett)",
          keySubstats: ["Energy Recharge (until threshold)", "CRIT Rate", "CRIT DMG", "Elemental Mastery", "ATK%"],
          targetNotes:
            "Never sacrifice ER for CRIT until you have at least 180-200% ER. A Pyronado that is delayed by even 3 seconds results in massive team DPS loss.",
        },
      },
    ],
  },

  Xingqiu: {
    characterName: "Xingqiu",
    element: "Hydro",
    weaponType: "Sword",
    role: "Off-Field Hydro Sub-DPS & Damage Reduction",
    overview:
      "Xingqiu's Raincutter provides relentless single-target Hydro application, high off-field damage, interruption resistance, and incoming damage reduction.",
    guideLinks: getCharacterGuideLinks("Xingqiu"),
    archetypes: [
      {
        id: "xingqiu-subdps",
        name: "Raincutter Sub-DPS",
        description:
          "Sustained off-field Hydro sword strikes enabling continuous Vaporize, Freeze, or Electro-Charged reactions.",
        talentPriority: [
          "Elemental Burst: Guhua Sword: Raincutter (Crown / Lv.10)",
          "Elemental Skill: Guhua Sword: Fatal Rainscreen (Lv.9)",
          "Normal Attack: Guhua Style (Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Sacrificial Sword",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "His iconic weapon: resets his long 21s Skill cooldown on hit (40-80% chance) and grants 61.3% ER, completely solving his energy needs.",
            sourceNote: "Standard Gacha (R3+ Recommended)",
          },
          {
            name: "Favonius Sword",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Consistent energy generation for both Xingqiu and his team.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Primordial Jade Cutter",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason: "44.1% CRIT Rate and ATK bonus from HP; best for C6 high-ER builds.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Fleuve Cendre Ferryman",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason: "Fontaine fishing sword with 45.9% ER and Skill CRIT Rate.",
            sourceNote: "Fontaine Fishing Association",
          },
        ],
        bestArtifactSets: [
          {
            name: "Emblem of Severed Fate",
            type: "4-Piece",
            count: 4,
            bonusSummary: "ER +20% • Burst DMG +25% of ER.",
            reason: "Highest personal damage set for his Raincutter swords.",
          },
          {
            name: "Noblesse Oblige",
            type: "Alternative",
            count: 4,
            bonusSummary: "4pc: +20% Team ATK on Burst.",
            reason: "Great support option if no other teammate runs Noblesse.",
          },
        ],
        mainStats: {
          sands: ["ATK% (with Sacrificial R3+ / C6)", "Energy Recharge (without Sacrificial / C0)"],
          goblet: ["Hydro DMG Bonus"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "60% - 75% CRIT Rate / 120% - 150%+ CRIT DMG",
          recommendedEr: "170% - 190% (with Sacrificial Sword R3+) / 210% - 230% (without Sacrificial / C0)",
          keySubstats: ["Energy Recharge", "CRIT Rate", "CRIT DMG", "ATK%"],
          targetNotes:
            "At C6, his 3rd sword wave restores 3 energy on hit, reducing his ER requirements by approximately 25-30%.",
        },
      },
    ],
  },

  Mitya: {
    characterName: "Mitya",
    element: "Electro",
    weaponType: "Catalyst",
    role: "On-Field Electro DPS & Stellar-Conduct Specialist",
    overview:
      "As highlighted in Game8 archive 606906 and Icy-Veins build guides, Mitya is a premier 5-star Electro Catalyst character from Snezhnaya who excels in triggering Stellar-Conduct and Electro-charged reactions. He scales significantly with Elemental Mastery and CRIT stats, delivering rapid-fire off-field and on-field Electro damage with Gradient Beacons.",
    guideLinks: getCharacterGuideLinks({ avatarId: 10000108, name: "Mitya" }),
    archetypes: [
      {
        id: "mitya-stellar-dps",
        name: "Stellar-Conduct / Reaction DPS",
        description:
          "High-reaction Electro DPS focused on Elemental Mastery, Gradient Beacon field deployment, and continuous reaction triggers with Thundering Fury or Gilded Dreams.",
        talentPriority: [
          "Elemental Skill: Rules Set at Naught (Primary / Crown)",
          "Elemental Burst: Beacon Discharge (Lv.9-10)",
          "Normal Attack: Kinetic Calibration (Lv.6-8)",
        ],
        bestWeapons: [
          {
            name: "Gradient Beacon",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "Signature 5★ Catalyst providing 66.2% CRIT DMG, massive Elemental Skill DMG bonus, and bonus EM scaling upon triggering Electro reactions.",
            sourceNote: "Signature Weapon Banner",
          },
          {
            name: "Kagura's Verity",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "66.2% CRIT DMG and stacking Elemental Skill DMG buffs that synchronize with Mitya's multiple Skill charges.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "A Thousand Floating Dreams",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "Provides an enormous 265 EM substat, party EM sharing, and matching Elemental DMG bonuses.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "The Widsith",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "55.1% CRIT DMG with massive 10-second buffs to ATK%, Elemental DMG, or 480 EM (R5). Every song theme benefits Mitya's kit.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Sacrificial Fragments",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "221 EM substat with an 80% chance on Skill hit to reset cooldown, enabling instant back-to-back Gradient Beacon deployment.",
            sourceNote: "Standard Gacha",
          },
          {
            name: "Mappa Mare",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Craftable F2P catalyst offering EM and up to +32% Elemental DMG bonus after triggering reactions.",
            sourceNote: "Forge Craftable",
          },
        ],
        bestArtifactSets: [
          {
            name: "Gilded Dreams",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: EM +80 • 4pc: Triggering a reaction grants +14% ATK per same-element teammate and +50 EM per different-element teammate (up to +150 EM).",
            reason:
              "Top overall DPS set for reaction-heavy teams (Quicken, Electro-Charged, Hyperbloom, Stellar-Conduct).",
            weaponSynergyNotes: {
              "Gradient Beacon": "✨ BiS Signature: Massive EM buff from Gilded Dreams (+80 to +230 EM) stacks multiplicatively with Beacon's reaction damage scaling!",
              "Kagura's Verity": "✨ Top 5★ Alternative: High 66.2% CRIT DMG and base ATK leverages Gilded Dreams ATK% buffs.",
              "The Widsith": "✨ Best 4★ / F2P: CRIT DMG substat covers whichever stat Gilded Dreams didn't max out (ATK, DMG%, or EM).",
              "A Thousand Floating Dreams": "✨ Top 5★ Stat Stick: Pushes Mitya past 700+ EM for massive reaction scaling.",
              "Sacrificial Fragments": "✨ Accessible EM baseline with Skill reset flexibility.",
              "Mappa Mare": "✨ Craftable F2P option providing EM and reaction DMG stacks.",
            },
            recommendedWeapons: [
              {
                name: "Gradient Beacon",
                rarity: 5,
                tier: "BiS (Signature)",
                reason:
                  "66.2% CRIT DMG; EM buff from Gilded Dreams (+80 to +230 EM) stacks multiplicatively with Beacon's reaction damage scaling.",
                sourceNote: "Signature Weapon Banner",
              },
              {
                name: "Kagura's Verity",
                rarity: 5,
                tier: "Top Alternative (5★)",
                reason:
                  "66.2% CRIT DMG; high base ATK leverages Gilded Dreams ATK% bonus (+14-28% ATK).",
                sourceNote: "Limited Weapon Banner",
              },
              {
                name: "The Widsith",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason:
                  "55.1% CRIT DMG; Aria, Recitative, and Interlude song themes all benefit Mitya's Gilded reaction setup.",
                sourceNote: "Standard Gacha",
              },
              {
                name: "A Thousand Floating Dreams",
                rarity: 5,
                tier: "Top Alternative (5★)",
                reason:
                  "Provides 265 EM and party EM sharing, saturating reaction multipliers.",
                sourceNote: "Limited Weapon Banner",
              },
              {
                name: "Sacrificial Fragments",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason:
                  "221 EM substat with Skill reset for immediate second beacon placement.",
                sourceNote: "Standard Gacha",
              },
              {
                name: "Mappa Mare",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason:
                  "Craftable EM catalyst providing up to +32% Elemental DMG bonus on reaction.",
                sourceNote: "Forge Craftable",
              },
            ],
          },
          {
            name: "Thundering Fury",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: Electro DMG +15% • 4pc: Overloaded, Electro-Charged, Superconduct, and Hyperbloom DMG +40%, and reduces Skill CD by 1s every 0.8s.",
            reason:
              "Maximizes skill uptime and reaction multipliers, allowing constant skill repositioning.",
            weaponSynergyNotes: {
              "Gradient Beacon": "✨ TF Signature: Rapid TF cooldown resets guarantee continuous beacon uptime and reaction procs.",
              "Sacrificial Fragments": "✨ Elevated to Top Tier: TF's 1s CD reduction every 0.8s paired with Sacrificial's instant Skill reset creates a constant Skill loop!",
              "Kagura's Verity": "✨ Permanent Stacks: Fast TF skill resets maintain 3 Kagura stacks permanently throughout combat.",
              "The Widsith": "✨ High Burst Windows: Delivers massive damage bursts during uninterrupted skill rotations.",
              "Mappa Mare": "✨ Constant Electro reactions keep max passive stacks refreshed.",
              "A Thousand Floating Dreams": "✨ Consistent EM and party elemental DMG buff.",
            },
            recommendedWeapons: [
              {
                name: "Gradient Beacon",
                rarity: 5,
                tier: "BiS (Signature)",
                reason:
                  "Rapid TF cooldown resets maintain permanent beacon uptime and continuous reaction damage.",
                sourceNote: "Signature Weapon Banner",
              },
              {
                name: "Sacrificial Fragments",
                rarity: 4,
                tier: "Top Alternative (5★)",
                reason:
                  "Elevated for Thundering Fury: TF's 1s CD reduction paired with Sacrificial's instant reset creates an endless beacon spam rotation!",
                sourceNote: "Standard Gacha",
              },
              {
                name: "Kagura's Verity",
                rarity: 5,
                tier: "Top Alternative (5★)",
                reason:
                  "Fast TF skill resets easily maintain 3 Kagura stacks (+36% Skill DMG) permanently.",
                sourceNote: "Limited Weapon Banner",
              },
              {
                name: "The Widsith",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason:
                  "55.1% CRIT DMG; high burst windows during rapid-fire skill loops.",
                sourceNote: "Standard Gacha",
              },
              {
                name: "Mappa Mare",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason:
                  "Craftable EM catalyst; constant Electro reactions keep max +32% DMG stacks refreshed.",
                sourceNote: "Forge Craftable",
              },
              {
                name: "A Thousand Floating Dreams",
                rarity: 5,
                tier: "Situational / Alternative",
                reason: "265 EM stat stick for reaction-focused teams.",
                sourceNote: "Limited Weapon Banner",
              },
            ],
          },
          {
            name: "Golden Troupe",
            type: "Alternative",
            count: 4,
            bonusSummary:
              "2pc: Skill DMG +20% • 4pc: Skill DMG +25%, plus an extra +25% when the character is off-field.",
            reason:
              "Exceptional if playing Mitya in a quickswap or sub-DPS role where Gradient Beacons deal damage off-field.",
            weaponSynergyNotes: {
              "Kagura's Verity": "✨ BiS Skill Multiplier: Kagura's +36% Skill DMG stacks multiplicatively with Golden Troupe's +70% off-field Skill DMG!",
              "Gradient Beacon": "✨ Signature Beacon: 66.2% CRIT DMG and reaction scaling on beacon strikes.",
              "The Widsith": "✨ Massive Multipliers: 55.1% CRIT DMG amplifies Golden Troupe's +70% damage bonus.",
              "Sacrificial Fragments": "✨ Quickswap Utility: Double beacon placement before rotating off-field.",
              "A Thousand Floating Dreams": "✨ Off-field EM sharing and elemental DMG.",
              "Mappa Mare": "✨ Craftable budget option with elemental DMG stacks.",
            },
            recommendedWeapons: [
              {
                name: "Kagura's Verity",
                rarity: 5,
                tier: "BiS (Signature)",
                reason:
                  "Rises to #1 BiS alongside Gradient Beacon: Kagura's +36% Skill DMG stacks multiplicatively with Golden Troupe's massive +70% off-field Skill DMG!",
                sourceNote: "Limited Weapon Banner",
              },
              {
                name: "Gradient Beacon",
                rarity: 5,
                tier: "BiS (Signature)",
                reason:
                  "Signature 5★ Catalyst providing 66.2% CRIT DMG and reaction scaling on off-field beacon strikes.",
                sourceNote: "Signature Weapon Banner",
              },
              {
                name: "The Widsith",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason:
                  "55.1% CRIT DMG; amplifies Golden Troupe's +70% damage bonus to huge numbers on rotation entry.",
                sourceNote: "Standard Gacha",
              },
              {
                name: "Sacrificial Fragments",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason:
                  "Double beacon placement before rotating off-field for full Golden Troupe uptime.",
                sourceNote: "Standard Gacha",
              },
              {
                name: "A Thousand Floating Dreams",
                rarity: 5,
                tier: "Top Alternative (5★)",
                reason: "265 EM for off-field reaction damage and party buffs.",
                sourceNote: "Limited Weapon Banner",
              },
              {
                name: "Mappa Mare",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason: "Craftable EM catalyst for budget off-field play.",
                sourceNote: "Forge Craftable",
              },
            ],
          },
          {
            name: "2pc Gilded Dreams (+80 EM) + 2pc Thundering Fury (+15% Electro)",
            type: "2-Piece Combo",
            count: 2,
            bonusSummary: "+80 EM and +15% Electro DMG Bonus.",
            reason:
              "High-stat generalist baseline while farming for high-CV 4pc sets.",
            weaponSynergyNotes: {
              "Gradient Beacon": "✨ BiS Generalist: Universal CRIT DMG and reaction bonus.",
              "Kagura's Verity": "✨ High CRIT DMG and sustained Skill DMG.",
              "The Widsith": "✨ High-CV 4★ burst catalyst.",
              "Sacrificial Fragments": "✨ 221 EM stat stick and cooldown utility.",
            },
            recommendedWeapons: [
              {
                name: "Gradient Beacon",
                rarity: 5,
                tier: "BiS (Signature)",
                reason: "Universal BiS providing 66.2% CRIT DMG and reaction scaling.",
                sourceNote: "Signature Weapon Banner",
              },
              {
                name: "Kagura's Verity",
                rarity: 5,
                tier: "Top Alternative (5★)",
                reason: "66.2% CRIT DMG and Skill DMG stacks.",
                sourceNote: "Limited Weapon Banner",
              },
              {
                name: "The Widsith",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason: "55.1% CRIT DMG with high random 10s song buffs.",
                sourceNote: "Standard Gacha",
              },
              {
                name: "Sacrificial Fragments",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason: "221 EM and Skill cooldown reset.",
                sourceNote: "Standard Gacha",
              },
              {
                name: "Mappa Mare",
                rarity: 4,
                tier: "Best 4★ / F2P",
                reason: "Craftable baseline catalyst.",
                sourceNote: "Forge Craftable",
              },
            ],
          },
        ],
        mainStats: {
          sands: ["Elemental Mastery", "Energy Recharge (if burst uptime < 100%)"],
          goblet: ["Electro DMG Bonus", "Elemental Mastery"],
          circlet: ["CRIT Rate", "CRIT DMG", "Elemental Mastery"],
        },
        benchmarks: {
          critRatio: "65%+ CRIT Rate / 140%+ CRIT DMG",
          recommendedEr: "120% - 135%",
          keySubstats: [
            "Elemental Mastery",
            "CRIT Rate",
            "CRIT DMG",
            "Energy Recharge",
            "ATK%",
          ],
          targetNotes:
            "Cross-referenced with Game8 archive 606906 and Icy-Veins. Prioritize 300-500+ EM before balancing CRIT near a 1:2 ratio.",
        },
      },
    ],
  },

  Valeriy: {
    characterName: "Valeriy",
    element: "Electro",
    weaponType: "Sword",
    role: "Off-Field Support & Stellar-Conduct Shielder",
    overview:
      "Featured in Game8's Best Stellar Conduct Support Build, Valeriy is a 4-star Electro Sword support from Snezhnaya who shields and empowers teammates. His shielding and off-field team buffs scale heavily with ATK, making him the premier defensive enabler for Stellar-Conduct carries like Mitya.",
    guideLinks: getCharacterGuideLinks({ avatarId: 10000109, name: "Valeriy" }),
    archetypes: [
      {
        id: "valeriy-stellar-conduct-support",
        name: "Best Stellar Conduct Support Build",
        role: "Off-Field Support",
        description:
          "Authoritative Game8 build maximizing Valeriy's ATK-scaling shield absorption and teamwide Stellar-Conduct reaction amplification.",
        talentPriority: [
          "Elemental Skill (Shield absorption & Stellar-Conduct enablement)",
          "Elemental Burst (Off-field Electro application & ATK buffing)",
          "Normal Attack (Leave at Lv.1)",
        ],
        bestWeapons: [
          {
            name: "Summit Shaper",
            rarity: 5,
            tier: "BiS (Signature)",
            reason:
              "608 Base ATK and massive +49.6% ATK substat, plus +20% Shield Strength and up to +40% ATK when protected by his shield.",
            sourceNote: "Limited Weapon Banner",
          },
          {
            name: "Aquila Favonia",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "Massive 674 Base ATK and unconditional +20% ATK passive, maximizing Valeriy's ATK-scaling shield strength.",
            sourceNote: "Standard Banner",
          },
          {
            name: "Skyward Blade",
            rarity: 5,
            tier: "Top Alternative (5★)",
            reason:
              "608 Base ATK and 55.1% Energy Recharge, ensuring consistent 100% burst uptime on cooldown.",
            sourceNote: "Standard Banner",
          },
          {
            name: "Calamity of Eshu",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "565 Base ATK and Normal/Skill damage bonuses, offering high base stats for ATK-scaling support.",
            sourceNote: "Event Exclusive Weapon",
          },
          {
            name: "Moonweaver's Dawn",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "Provides ATK% and Energy Recharge tailored for Snezhnayan support kits.",
            sourceNote: "Gacha / Event Banner",
          },
          {
            name: "Finale of the Deep",
            rarity: 4,
            tier: "Best 4★ / F2P",
            reason:
              "565 Base ATK, 27.6% ATK substat, and +12% ATK after casting Elemental Skill (plus flat ATK on Bond of Life clearance).",
            sourceNote: "Fontaine / F2P Craftable",
          },
        ],
        bestArtifactSets: [
          {
            name: "A Day Carved from Rising Winds",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: ATK +18% • 4pc: After a Normal Attack, grants Blessing of Pastoral Winds. Triggers reaction bonuses and team buffs even when off-field.",
            reason:
              "Game8 Recommended #1 Best Artifact: Perfect synergy with Valeriy's ATK scaling and off-field Stellar-Conduct support.",
          },
          {
            name: "Heart of the Furnace",
            type: "4-Piece",
            count: 4,
            bonusSummary:
              "2pc: ATK +18% • 4pc: Amplifies teamwide reaction damage and Stellar-Conduct / Stellar-Glimmer output based on ATK.",
            reason:
              "Game8 Recommended Alternate Artifact: Provides high ATK scaling and amplifies team reaction multipliers in Mitya compositions.",
          },
          {
            name: "Noblesse Oblige",
            type: "Alternative",
            count: 4,
            bonusSummary:
              "2pc: Burst DMG +20% • 4pc: Using an Elemental Burst increases all party members' ATK by 20% for 12s.",
            reason:
              "Universal support alternative providing party-wide ATK buffing on Burst cast.",
          },
        ],
        mainStats: {
          sands: ["ATK%"],
          goblet: ["ATK%"],
          circlet: ["ATK%"],
        },
        benchmarks: {
          critRatio: "CRIT is secondary; prioritize maximum ATK% and Energy Recharge.",
          recommendedEr: "140% - 160% (130% with Skyward Blade)",
          keySubstats: ["ATK%", "ATK (Flat)", "Energy Recharge"],
          targetNotes:
            "From Game8: Prioritize triple ATK% main stats (Sands, Goblet, Circlet) to directly maximize Valeriy's shield absorption and teamwide Stellar-Conduct reaction scaling.",
        },
      },
    ],
  },
};

export function detectWeaponType(
  character: ShowcaseCharacter
): "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst" {
  const icon = character.weapon.iconUrl?.toLowerCase() ?? "";
  const name = character.weapon.name.toLowerCase();

  if (
    icon.includes("pole") ||
    name.includes("spear") ||
    name.includes("lance") ||
    name.includes("halberd") ||
    name.includes("catch") ||
    name.includes("tassel") ||
    name.includes("homa") ||
    name.includes("semblance")
  ) {
    return "Polearm";
  }
  if (
    icon.includes("bow") ||
    name.includes("bow") ||
    name.includes("warbow") ||
    name.includes("harp") ||
    name.includes("stringless") ||
    name.includes("rust") ||
    name.includes("slingshot") ||
    name.includes("simulacra") ||
    name.includes("elegy")
  ) {
    return "Bow";
  }
  if (
    icon.includes("claymore") ||
    name.includes("claymore") ||
    name.includes("greatsword") ||
    name.includes("slasher") ||
    name.includes("unforged") ||
    name.includes("gravestone") ||
    name.includes("whiteblind") ||
    name.includes("serpent")
  ) {
    return "Claymore";
  }
  if (
    icon.includes("catalyst") ||
    name.includes("catalyst") ||
    name.includes("grimoire") ||
    name.includes("tome") ||
    name.includes("atlas") ||
    name.includes("widsith") ||
    name.includes("amber") ||
    name.includes("floating dreams") ||
    name.includes("fragments") ||
    name.includes("prayer")
  ) {
    return "Catalyst";
  }
  if (
    icon.includes("sword") ||
    name.includes("sword") ||
    name.includes("blade") ||
    name.includes("cutter") ||
    name.includes("mistsplitter") ||
    name.includes("aquila") ||
    name.includes("amenoma") ||
    name.includes("sting") ||
    name.includes("ferryman")
  ) {
    return "Sword";
  }

  const charKnownMap: Record<
    string,
    "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst"
  > = {
    Zhongli: "Polearm",
    "Hu Tao": "Polearm",
    Xiangling: "Polearm",
    Xiao: "Polearm",
    Cyno: "Polearm",
    Chevreuse: "Polearm",
    Shenhe: "Polearm",
    Rosaria: "Polearm",
    Xingqiu: "Sword",
    Alhaitham: "Sword",
    Clorinde: "Sword",
    Xilonen: "Sword",
    Kazuha: "Sword",
    "Kaedehara Kazuha": "Sword",
    Bennett: "Sword",
    Furina: "Sword",
    Ayaka: "Sword",
    "Kamisato Ayaka": "Sword",
    Ayato: "Sword",
    "Kamisato Ayato": "Sword",
    Nilou: "Sword",
    Jean: "Sword",
    Keqing: "Sword",
    Fischl: "Bow",
    Chasca: "Bow",
    Yelan: "Bow",
    Ganyu: "Bow",
    Tighnari: "Bow",
    Yoimiya: "Bow",
    Lyney: "Bow",
    Venti: "Bow",
    Neuvillette: "Catalyst",
    Mitya: "Catalyst",
    Nahida: "Catalyst",
    Mualani: "Catalyst",
    Citlali: "Catalyst",
    Wanderer: "Catalyst",
    Baizhu: "Catalyst",
    Xianyun: "Catalyst",
    Yae: "Catalyst",
    "Yae Miko": "Catalyst",
    Mona: "Catalyst",
    Sucrose: "Catalyst",
    Kinich: "Claymore",
    Navia: "Claymore",
    Itto: "Claymore",
    "Arataki Itto": "Claymore",
    Diluc: "Claymore",
    Eula: "Claymore",
    Dehya: "Claymore",
    Noelle: "Claymore",
    Beidou: "Claymore",
    Gaming: "Claymore",
  };

  const norm = normalizeCharacterName(character.name);
  return charKnownMap[norm] ?? charKnownMap[character.name] ?? "Sword";
}

const KNOWN_FOUR_STAR_CHARACTERS = new Set([
  "Amber",
  "Kaeya",
  "Lisa",
  "Barbara",
  "Razor",
  "Xiangling",
  "Beidou",
  "Xingqiu",
  "Ningguang",
  "Fischl",
  "Bennett",
  "Noelle",
  "Chongyun",
  "Sucrose",
  "Diona",
  "Xinyan",
  "Rosaria",
  "Yanfei",
  "Sayu",
  "Kujou Sara",
  "Sara",
  "Thoma",
  "Gorou",
  "Yun Jin",
  "Yunjin",
  "Kuki Shinobu",
  "Shinobu",
  "Shikanoin Heizou",
  "Heizou",
  "Collei",
  "Dori",
  "Candace",
  "Layla",
  "Faruzan",
  "Yaoyao",
  "Mika",
  "Kaveh",
  "Kirara",
  "Lynette",
  "Freminet",
  "Charlotte",
  "Chevreuse",
  "Gaming",
  "Sethos",
  "Kachina",
  "Ororon",
  "Lan Yan",
  "Iansan",
]);

export function detectCharacterRarity(character: ShowcaseCharacter): 4 | 5 {
  if (character.rarity === 4 || character.rarity === 5) {
    return character.rarity;
  }
  const norm = normalizeCharacterName(character.name);
  if (
    KNOWN_FOUR_STAR_CHARACTERS.has(character.name) ||
    KNOWN_FOUR_STAR_CHARACTERS.has(norm)
  ) {
    return 4;
  }
  return 5;
}

export function generateRoleSpecificArchetype(
  character: ShowcaseCharacter,
  role: CombatRole,
  weaponType?: "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst",
  normName?: string
): BuildArchetype {
  const wType = weaponType ?? detectWeaponType(character);
  const name = normName ?? normalizeCharacterName(character.name);
  const slug = getCharacterSlug(name);
  const elem = character.element;

  const isHpScaler =
    character.stats.maxHp > 32000 ||
    ["Furina", "Neuvillette", "Yelan", "Nilou", "Hu Tao", "Zhongli", "Dehya", "Baizhu"].includes(
      name
    );
  const isDefScaler =
    character.stats.def > 1200 ||
    ["Xilonen", "Arataki Itto", "Itto", "Albedo", "Chiori", "Noelle"].includes(
      name
    );

  if (role === "Healer" || role === "Off-Field Healer" || role === "On-Field Healer") {
    const healerWeapons: Record<
      "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst",
      WeaponRecommendation[]
    > = {
      Catalyst: [
        {
          name: "Prototype Amber (R5)",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "41.3% HP, flat energy refund on burst, and heals the entire team.",
          sourceNote: "Forge Craftable",
        },
        {
          name: "Everlasting Moonglow",
          rarity: 5,
          tier: "Top Alternative (5★)",
          reason: "49.6% HP, +10% Healing Bonus, and normal attack energy restore.",
          sourceNote: "Limited Weapon Banner",
        },
        {
          name: "Favonius Codex",
          rarity: 4,
          tier: "Best 4★ / F2P",
          reason: "High ER and team particle generation for 100% burst uptime.",
          sourceNote: "Standard Gacha",
        },
      ],
      Sword: [
        {
          name: "Favonius Sword",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "61.3% ER and generates party particles on CRIT.",
          sourceNote: "Standard Gacha",
        },
        {
          name: "The Dockhand's Assistant",
          rarity: 4,
          tier: "Best 4★ / F2P",
          reason: "41.3% HP substat boosting healing scaling.",
          sourceNote: "Limited Weapon Banner",
        },
        {
          name: "Skyward Blade",
          rarity: 5,
          tier: "Top Alternative (5★)",
          reason: "High Base ATK with 55.1% ER.",
          sourceNote: "Standard Banner",
        },
      ],
      Polearm: [
        {
          name: "Favonius Lance",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "30.6% ER and clear white particle generation.",
          sourceNote: "Standard Gacha",
        },
        {
          name: "Rightful Reward",
          rarity: 4,
          tier: "Best 4★ / F2P",
          reason: "Craftable Fontaine polearm with 27.6% HP and energy refund on heal.",
          sourceNote: "Forge Craftable",
        },
        {
          name: "Black Tassel",
          rarity: 3,
          tier: "Best 4★ / F2P",
          reason: "46.9% HP substat maximizing HP-scaling heals.",
          sourceNote: "Common 3★ Gacha",
        },
      ],
      Bow: [
        {
          name: "Favonius Warbow",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "61.3% ER guaranteeing Burst is ready on cooldown.",
          sourceNote: "Archon Quest / Gacha",
        },
        {
          name: "Recurve Bow",
          rarity: 3,
          tier: "Best 4★ / F2P",
          reason: "46.9% HP substat for HP-scaling healers.",
          sourceNote: "Chests in Mondstadt/Liyue",
        },
      ],
      Claymore: [
        {
          name: "Favonius Greatsword",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "61.3% ER and party particle generation.",
          sourceNote: "Standard Gacha",
        },
        {
          name: "Sacrificial Greatsword",
          rarity: 4,
          tier: "Top Alternative (5★)",
          reason: "30.6% ER and resets Skill cooldown.",
          sourceNote: "Standard Gacha",
        },
      ],
    };

    return {
      id: `${slug}-healer`,
      name: `${role} Sustain Setup`,
      role: role,
      description: `Recommended ${name} healing setup maximizing sustained recovery and team survivability.`,
      talentPriority: ["Elemental Burst (Primary)", "Elemental Skill", "Normal Attack"],
      bestWeapons: healerWeapons[wType] ?? healerWeapons.Sword,
      bestArtifactSets: [
        {
          name: "Maiden Beloved",
          type: "4-Piece",
          count: 4,
          bonusSummary:
            "2pc: Healing Effectiveness +15% • 4pc: Using Skill/Burst increases healing received by all party members by 20% for 10s.",
          reason: "Universal best healing volume artifact set.",
        },
        {
          name: "Ocean-Hued Clam",
          type: "Alternative",
          count: 4,
          bonusSummary:
            "2pc: Healing Bonus +15% • 4pc: Accumulates healing into Sea-Dyed Foam that bursts for up to 30,000 Physical DMG.",
          reason: "Converts high overhealing into physical area damage.",
        },
        {
          name: "Song of Days Past",
          type: "Alternative",
          count: 4,
          bonusSummary:
            "2pc: Healing Bonus +15% • 4pc: Grants Waves of Days Past flat damage buff to active character based on healing.",
          reason: "Modern Fontaine support/healer hybrid set.",
        },
      ],
      mainStats: {
        sands: ["Energy Recharge", isHpScaler ? "HP%" : isDefScaler ? "DEF%" : "ATK%"],
        goblet: [isHpScaler ? "HP%" : isDefScaler ? "DEF%" : "ATK%"],
        circlet: ["Healing Bonus", isHpScaler ? "HP%" : isDefScaler ? "DEF%" : "ATK%"],
      },
      benchmarks: {
        critRatio: "30%+ CRIT Rate (if using Favonius)",
        recommendedEr: "180% - 220%+",
        keySubstats: ["Energy Recharge", isHpScaler ? "HP%" : isDefScaler ? "DEF%" : "ATK%", "CRIT Rate"],
        targetNotes: "Prioritize Healing Bonus circlet and sufficient ER to trigger Burst reliably every rotation.",
      },
    };
  }

  if (role === "Support" || role === "Off-Field Support" || role === "On-Field Support") {
    const supportWeapons: Record<
      "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst",
      WeaponRecommendation[]
    > = {
      Catalyst: [
        {
          name: "Thrilling Tales of Dragon Slayers",
          rarity: 3,
          tier: "BiS (Signature)",
          reason: "35.2% HP and grants incoming active character an astronomical +48% ATK buff for 10s.",
          sourceNote: "Common 3★ Gacha (R5 Recommended)",
        },
        {
          name: "Favonius Codex",
          rarity: 4,
          tier: "Top Alternative (5★)",
          reason: "High ER and team particle battery.",
          sourceNote: "Standard Gacha",
        },
        {
          name: "Sacrificial Fragments",
          rarity: 4,
          tier: "Best 4★ / F2P",
          reason: "221 EM and Skill cooldown reset.",
          sourceNote: "Standard Gacha",
        },
      ],
      Sword: [
        {
          name: "Favonius Sword",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "61.3% ER and generates 6 white energy particles on CRIT.",
          sourceNote: "Standard Gacha",
        },
        {
          name: "Freedom-Sworn",
          rarity: 5,
          tier: "Top Alternative (5★)",
          reason: "198 EM and team +20% ATK +16% Normal/CA DMG buff.",
          sourceNote: "Limited Weapon Banner",
        },
        {
          name: "Sacrificial Sword",
          rarity: 4,
          tier: "Best 4★ / F2P",
          reason: "61.3% ER and 80% chance to reset Skill cooldown.",
          sourceNote: "Standard Gacha",
        },
      ],
      Polearm: [
        {
          name: "Favonius Lance",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "High ER and team particle generation on CRIT.",
          sourceNote: "Standard Gacha",
        },
        {
          name: "Dragon's Bane",
          rarity: 4,
          tier: "Top Alternative (5★)",
          reason: "221 EM for reaction enabling and triggering.",
          sourceNote: "Standard Gacha",
        },
        {
          name: "Rightful Reward",
          rarity: 4,
          tier: "Best 4★ / F2P",
          reason: "Craftable Fontaine polearm with HP% and energy refund.",
          sourceNote: "Forge Craftable",
        },
      ],
      Bow: [
        {
          name: "Elegy for the End",
          rarity: 5,
          tier: "BiS (Signature)",
          reason: "55.1% ER and party buff: +100 EM and +20% ATK.",
          sourceNote: "Limited Weapon Banner",
        },
        {
          name: "Favonius Warbow",
          rarity: 4,
          tier: "Best 4★ / F2P",
          reason: "61.3% ER ensuring team energy battery uptime.",
          sourceNote: "Archon Quest / Gacha",
        },
        {
          name: "The Stringless",
          rarity: 4,
          tier: "Top Alternative (5★)",
          reason: "165 EM and +24-48% Skill/Burst DMG.",
          sourceNote: "Standard Gacha",
        },
      ],
      Claymore: [
        {
          name: "Favonius Greatsword",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "61.3% ER and particle battery.",
          sourceNote: "Standard Gacha",
        },
        {
          name: "Sacrificial Greatsword",
          rarity: 4,
          tier: "Best 4★ / F2P",
          reason: "Resets Skill cooldown.",
          sourceNote: "Standard Gacha",
        },
      ],
    };

    const primarySupportSet =
      elem === "Anemo"
        ? "Viridescent Venerer"
        : elem === "Dendro"
        ? "Deepwood Memories"
        : elem === "Geo"
        ? "Scroll of the Hero of Tona"
        : "Noblesse Oblige";

    const primarySupportReason =
      elem === "Anemo"
        ? "Decreases opponent Elemental RES to swirled element by 40% for 10s."
        : elem === "Dendro"
        ? "Decreases opponent Dendro RES by 30% for 8s on Skill/Burst hit."
        : "Increases all party members' ATK by 20% for 12s after Burst.";

    return {
      id: `${slug}-support`,
      name: `${role} Utility Setup`,
      role: role,
      description: `Recommended ${name} utility configuration prioritizing party buffs, resistance shredding, and energy battery generation.`,
      talentPriority: ["Elemental Burst (Primary)", "Elemental Skill", "Normal Attack"],
      bestWeapons: supportWeapons[wType] ?? supportWeapons.Sword,
      bestArtifactSets: [
        {
          name: primarySupportSet,
          type: "4-Piece",
          count: 4,
          bonusSummary: primarySupportReason,
          reason: "Best-in-slot team utility set.",
        },
        {
          name: "Tenacity of the Millelith",
          type: "Alternative",
          count: 4,
          bonusSummary: "4pc: +20% Team ATK and +30% Shield Strength when Skill hits.",
          reason: "Universal team attack buff for Skill-based supporters.",
        },
        {
          name: "Noblesse Oblige",
          type: "Alternative",
          count: 4,
          bonusSummary: "4pc: +20% Team ATK on Burst for 12s.",
          reason: "Universal team attack buff.",
        },
      ],
      mainStats: {
        sands: ["Energy Recharge", "Elemental Mastery", isHpScaler ? "HP%" : "ATK%"],
        goblet: ["Elemental Mastery", isHpScaler ? "HP%" : `${elem} DMG Bonus`],
        circlet: ["CRIT Rate", "Elemental Mastery", isHpScaler ? "HP%" : "ATK%"],
      },
      benchmarks: {
        critRatio: "40%+ CRIT Rate (for Favonius particle triggers)",
        recommendedEr: "180% - 220%",
        keySubstats: ["Energy Recharge", "CRIT Rate", "Elemental Mastery"],
        targetNotes: "Focus on maximizing team utility uptime, resistance shred, and consistent particle funneling.",
      },
    };
  }

  if (role === "Sub-DPS" || role === "Off-Field DPS") {
    return {
      id: `${slug}-subdps`,
      name: `${role} Off-Field Setup`,
      role: role,
      description: `Recommended ${name} off-field damage build utilizing high burst or skill scaling to contribute team damage from off-field.`,
      talentPriority: ["Elemental Burst", "Elemental Skill", "Normal Attack"],
      bestWeapons: [
        {
          name: "Golden Troupe / Off-Field Option",
          rarity: 4,
          tier: "BiS (Signature)",
          reason: "Optimized for maximum off-field Skill and Burst damage.",
        },
      ],
      bestArtifactSets: [
        {
          name: "Golden Troupe",
          type: "4-Piece",
          count: 4,
          bonusSummary:
            "2pc: Skill DMG +20% • 4pc: Skill DMG +25%, plus additional +25% when off-field (total +70% Skill DMG).",
          reason: "Unsurpassed damage ceiling for off-field Skill users.",
        },
        {
          name: "Emblem of Severed Fate",
          type: "Alternative",
          count: 4,
          bonusSummary:
            "2pc: ER +20% • 4pc: Increases Elemental Burst DMG by 25% of Energy Recharge (max 75%).",
          reason: "Premier off-field Burst nuke set.",
        },
      ],
      mainStats: {
        sands: ["Energy Recharge", isHpScaler ? "HP%" : "ATK%", "Elemental Mastery"],
        goblet: [`${elem} DMG Bonus`],
        circlet: ["CRIT Rate", "CRIT DMG"],
      },
      benchmarks: {
        critRatio: "65%+ CRIT Rate / 130%+ CRIT DMG",
        recommendedEr: "160% - 200%",
        keySubstats: ["CRIT Rate", "CRIT DMG", "Energy Recharge", "Elemental Mastery"],
        targetNotes: "Balance ER to ensure burst availability on cooldown, then scale Crit and elemental damage.",
      },
    };
  }

  // Default: On-Field Carry / DPS
  return {
    id: `${slug}-dps`,
    name: `${role} Carry Setup`,
    role: role,
    description: `Recommended ${name} carry build optimized for maximum personal damage output and on-field reaction scaling.`,
    talentPriority: ["Normal Attack", "Elemental Skill", "Elemental Burst"],
    bestWeapons: [
      {
        name: "Premier Carry Weapon",
        rarity: 5,
        tier: "BiS (Signature)",
        reason: "Optimized for high base ATK, CRIT Rate/DMG, and active field damage bonuses.",
      },
    ],
    bestArtifactSets: [
      {
        name: isHpScaler ? "Marechaussee Hunter" : "Gladiator's Finale",
        type: "4-Piece",
        count: 4,
        bonusSummary: "Carry DMG Bonus on field.",
        reason: `Optimized 4pc set for ${elem} character scaling and reaction output.`,
      },
      {
        name: "Noblesse Oblige",
        type: "Alternative",
        count: 4,
        bonusSummary: "4pc: +20% Team ATK on Burst for 12s.",
        reason: "Universal alternative.",
      },
    ],
    mainStats: {
      sands: [isHpScaler ? "HP%" : isDefScaler ? "DEF%" : "ATK%", "Energy Recharge"],
      goblet: [`${elem} DMG Bonus`],
      circlet: ["CRIT Rate", "CRIT DMG"],
    },
    benchmarks: {
      critRatio: "65%+ CRIT Rate / 130%+ CRIT DMG",
      recommendedEr: "130% - 160%",
      keySubstats: ["CRIT Rate", "CRIT DMG", "Energy Recharge"],
      targetNotes: "Balance ER for consistent rotation uptime, then maximize CRIT Rate/DMG near a 1:2 ratio.",
    },
  };
}

export function getArchetypesForRole(
  character: ShowcaseCharacter,
  role: CombatRole
): BuildArchetype[] {
  const guide = getEquipmentGuide(character, role);
  const matching = guide.archetypes.filter(
    (a) => a.role === role || isRoleMatch(a.role ?? "On-Field DPS", role)
  );
  if (matching.length > 0) {
    return matching;
  }
  return [generateRoleSpecificArchetype(character, role)];
}

export function generateDynamicEquipmentGuide(
  character: ShowcaseCharacter,
  targetRole?: CombatRole
): CharacterEquipmentGuide {
  const normName = normalizeCharacterName(character.name);
  const guideLinks = getCharacterGuideLinks(character);
  const weaponType = detectWeaponType(character);

  const rawRoles =
    character.roles && character.roles.length > 0
      ? character.roles
      : getCharacterCombatRoles(character.name, character.avatarId);

  const roles = targetRole
    ? [targetRole, ...rawRoles.filter((r) => r !== targetRole)]
    : rawRoles;

  const archetypes = roles.map((r) =>
    generateRoleSpecificArchetype(character, r, weaponType, normName)
  );

  return {
    characterName: normName,
    element: character.element,
    weaponType,
    role: `${character.element} Specialist / Carry`,
    overview: `${normName} is a versatile ${character.element} ${weaponType} wielder. Consult the Game8, Icy-Veins, and KeqingMains guides linked below for comprehensive community theorycraft builds and rotation details.`,
    guideLinks,
    archetypes,
  };
}

// Primary pairing table mapping character avatar IDs directly to curated equipment guides
export const CURATED_EQUIPMENT_GUIDES_BY_AVATAR_ID: Record<
  number | string,
  CharacterEquipmentGuide
> = {
  10000109: CURATED_EQUIPMENT_GUIDES["Valeriy"],
  10000108: CURATED_EQUIPMENT_GUIDES["Mitya"],
  10000096: CURATED_EQUIPMENT_GUIDES["Arlecchino"],
  10000089: CURATED_EQUIPMENT_GUIDES["Furina"],
  10000087: CURATED_EQUIPMENT_GUIDES["Neuvillette"],
  10000073: CURATED_EQUIPMENT_GUIDES["Nahida"],
  10000047: CURATED_EQUIPMENT_GUIDES["Kaedehara Kazuha"],
  10000052: CURATED_EQUIPMENT_GUIDES["Raiden Shogun"],
  10000032: CURATED_EQUIPMENT_GUIDES["Bennett"],
  10000060: CURATED_EQUIPMENT_GUIDES["Yelan"],
  10000030: CURATED_EQUIPMENT_GUIDES["Zhongli"],
  10000046: CURATED_EQUIPMENT_GUIDES["Hu Tao"],
  10000023: CURATED_EQUIPMENT_GUIDES["Xiangling"],
  10000015: CURATED_EQUIPMENT_GUIDES["Xingqiu"],
};

export function getEquipmentGuide(
  character: ShowcaseCharacter,
  targetRole?: CombatRole
): CharacterEquipmentGuide {
  let baseGuide: CharacterEquipmentGuide | undefined;

  // 1. Highest priority: Pair directly by the character's unique numerical Avatar ID
  const avatarIdNum = Number(character.avatarId);
  if (Number.isFinite(avatarIdNum) && avatarIdNum > 0) {
    const byId =
      CURATED_EQUIPMENT_GUIDES_BY_AVATAR_ID[avatarIdNum] ??
      CURATED_EQUIPMENT_GUIDES_BY_AVATAR_ID[String(avatarIdNum)];
    if (byId) {
      baseGuide = byId;
    }
  }

  // 2. Second priority: Pair by normalized name or canonical alias
  if (!baseGuide) {
    const norm = normalizeCharacterName(character.name);
    if (CURATED_EQUIPMENT_GUIDES[norm]) {
      baseGuide = CURATED_EQUIPMENT_GUIDES[norm];
    } else if (CURATED_EQUIPMENT_GUIDES[character.name]) {
      baseGuide = CURATED_EQUIPMENT_GUIDES[character.name];
    } else {
      baseGuide = generateDynamicEquipmentGuide(character, targetRole);
    }
  }

  // If targetRole is specified, reorder or prepend archetypes matching targetRole
  if (targetRole && baseGuide && baseGuide.archetypes.length > 0) {
    const matching = baseGuide.archetypes.filter(
      (a) => a.role === targetRole || isRoleMatch(a.role ?? "On-Field DPS", targetRole)
    );
    if (matching.length > 0) {
      const rest = baseGuide.archetypes.filter(
        (a) => a.role !== targetRole && !isRoleMatch(a.role ?? "On-Field DPS", targetRole)
      );
      return {
        ...baseGuide,
        archetypes: [...matching, ...rest],
      };
    } else {
      const dynamicArch = generateRoleSpecificArchetype(character, targetRole);
      return {
        ...baseGuide,
        archetypes: [dynamicArch, ...baseGuide.archetypes],
      };
    }
  }

  return baseGuide;
}

export function getWeaponsForArtifactSet(
  archetype: BuildArchetype,
  artifactSetName?: string
): WeaponRecommendation[] {
  if (!archetype || !archetype.bestWeapons) return [];

  const targetSet = artifactSetName
    ? archetype.bestArtifactSets.find(
        (s) =>
          s.name.toLowerCase() === artifactSetName.toLowerCase() ||
          s.name.toLowerCase().includes(artifactSetName.toLowerCase())
      ) ?? archetype.bestArtifactSets[0]
    : archetype.bestArtifactSets[0];

  // 1. If the artifact set has dedicated custom weapon recommendations, return them
  if (targetSet?.recommendedWeapons && targetSet.recommendedWeapons.length > 0) {
    return targetSet.recommendedWeapons;
  }

  // 2. Otherwise attach dynamic synergy notes & ranking adaptations
  const setLower = (targetSet?.name ?? "").toLowerCase();

  return archetype.bestWeapons.map((weapon) => {
    let synergyNote: string | undefined = targetSet?.weaponSynergyNotes?.[weapon.name];

    if (!synergyNote) {
      if (setLower.includes("marechaussee")) {
        if (
          weapon.tier === "BiS (Signature)" ||
          weapon.reason.includes("CRIT DMG") ||
          weapon.name.includes("Homa") ||
          weapon.name.includes("Eternal Flow")
        ) {
          synergyNote = "✨ 4pc Marechaussee Synergy: High CRIT DMG stat avoids overcapping with the set's +36% CRIT Rate!";
        } else if (
          weapon.reason.includes("CRIT Rate") ||
          weapon.name.includes("Deathmatch") ||
          weapon.name.includes("Sacrificial Jade")
        ) {
          synergyNote = "⚠️ CRIT Rate Alert: Set grants +36% CRIT Rate; keep base CRIT Rate around 50-64% to prevent overcapping 100%.";
        }
      } else if (setLower.includes("golden troupe")) {
        if (
          weapon.name.includes("Kagura") ||
          weapon.reason.includes("Skill DMG") ||
          weapon.name.includes("Festering") ||
          weapon.name.includes("Fleuve")
        ) {
          synergyNote = "✨ 4pc Golden Troupe Synergy: Weapon Skill buffs combine directly with Golden Troupe's +70% off-field Skill DMG!";
        }
      } else if (setLower.includes("thundering fury")) {
        if (weapon.name.includes("Sacrificial") || weapon.name.includes("Beacon") || weapon.name.includes("Kagura")) {
          synergyNote = "✨ 4pc Thundering Fury Synergy: 1s CD reduction every 0.8s allows rapid Skill casts, maximizing weapon proc frequency!";
        }
      } else if (setLower.includes("gilded dreams")) {
        if (weapon.reason.includes("CRIT") || weapon.name.includes("Beacon") || weapon.name.includes("Widsith") || weapon.name.includes("Verity")) {
          synergyNote = "✨ 4pc Gilded Dreams Synergy: +80 to +230 EM from set lets you heavily prioritize CRIT and Elemental DMG weapons!";
        }
      } else if (setLower.includes("emblem")) {
        if (weapon.reason.includes("ER") || weapon.name.includes("Engulfing") || weapon.name.includes("Catch") || weapon.name.includes("Favonius")) {
          synergyNote = "✨ 4pc Emblem Synergy: Energy Recharge substat converts directly into extra Elemental Burst DMG (up to +75%)!";
        }
      } else if (setLower.includes("crimson witch")) {
        if (weapon.reason.includes("EM") || weapon.name.includes("Scarlet Sands") || weapon.name.includes("Dragon's Bane") || weapon.name.includes("Fjords")) {
          synergyNote = "✨ 4pc Crimson Witch Synergy: Amplifies reaction multipliers, greatly boosting value of EM and reaction passives!";
        }
      } else if (setLower.includes("shimenawa")) {
        if (weapon.name.includes("Homa") || weapon.name.includes("Rust") || weapon.name.includes("Jade Winged-Spear")) {
          synergyNote = "✨ 4pc Shimenawa Synergy: Powers up Normal and Charged Attacks by +50% independently of Elemental Burst!";
        }
      } else if (setLower.includes("deepwood")) {
        if (weapon.name.includes("Floating Dreams") || weapon.name.includes("Evenstar") || weapon.name.includes("Sacrificial")) {
          synergyNote = "✨ 4pc Deepwood Synergy: Team Dendro RES shred combines with weapon EM/ATK party buffing!";
        }
      } else if (setLower.includes("noblesse")) {
        if (weapon.name.includes("Aquila") || weapon.name.includes("Mistsplitter") || weapon.name.includes("Sapwood") || weapon.name.includes("Skyward")) {
          synergyNote = "✨ 4pc Noblesse Synergy: High Base ATK and consistent Burst uptime maximize team-wide +20% ATK buff value!";
        }
      } else if (setLower.includes("rising winds")) {
        if (weapon.name.includes("Summit") || weapon.name.includes("Aquila") || weapon.name.includes("Calamity") || weapon.name.includes("Moonweaver") || weapon.name.includes("Finale")) {
          synergyNote = "✨ 4pc Rising Winds Synergy: Massive ATK scaling powers up team Pastoral Winds reaction buffs!";
        }
      } else if (setLower.includes("heart of the furnace") || setLower.includes("furnace")) {
        if (weapon.name.includes("Summit") || weapon.name.includes("Aquila") || weapon.name.includes("Skyward") || weapon.name.includes("Finale")) {
          synergyNote = "✨ 4pc Heart of the Furnace Synergy: High ATK scaling directly amplifies teamwide Stellar-Conduct reaction damage multipliers!";
        }
      }
    }

    return {
      ...weapon,
      reason: synergyNote ? `${weapon.reason} [${synergyNote}]` : weapon.reason,
    };
  });
}

export function getMainStatsForArtifactSet(
  archetype: BuildArchetype,
  artifactSetName?: string
): MainStatRecommendations {
  if (!archetype || !archetype.mainStats) {
    return { sands: ["ATK%"], goblet: ["Elemental DMG"], circlet: ["CRIT Rate", "CRIT DMG"] };
  }

  const targetSet = artifactSetName
    ? archetype.bestArtifactSets.find(
        (s) =>
          s.name.toLowerCase() === artifactSetName.toLowerCase() ||
          s.name.toLowerCase().includes(artifactSetName.toLowerCase())
      ) ?? archetype.bestArtifactSets[0]
    : archetype.bestArtifactSets[0];

  if (targetSet?.mainStatOverrides) {
    return {
      sands: targetSet.mainStatOverrides.sands ?? archetype.mainStats.sands,
      goblet: targetSet.mainStatOverrides.goblet ?? archetype.mainStats.goblet,
      circlet: targetSet.mainStatOverrides.circlet ?? archetype.mainStats.circlet,
    };
  }

  const setLower = (targetSet?.name ?? "").toLowerCase();
  if (setLower.includes("marechaussee")) {
    return {
      ...archetype.mainStats,
      circlet: [
        "CRIT DMG (Strongly Recommended to prevent CRIT Rate overcap)",
        ...archetype.mainStats.circlet.filter((c) => !c.toLowerCase().includes("rate")),
      ],
    };
  }

  return archetype.mainStats;
}
