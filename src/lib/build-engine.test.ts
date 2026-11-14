import { describe, expect, it } from "vitest";
import {
  calculateCritValue,
  compareEquippedWithRecommendations,
  countRollsFromAffixIds,
  detectScalingArchetype,
  estimateRolls,
  evaluateArtifacts,
  getBuildTier,
  getRollTier,
  tallyArtifactSets,
  type RawArtifactInput,
} from "./build-engine";
import {
  detectCharacterRarity,
  detectWeaponType,
} from "@/lib/equipment-data";
import type {
  CharacterEquipmentGuide,
  CharacterStats,
  ShowcaseCharacter,
} from "@/types/genshin";
import {
  createMockArtifacts,
  createMockCharacter,
  createMockWeapon,
} from "@/lib/test-fixtures";

describe("build-engine: CV and Roll Tier calculations", () => {
  it("calculates Crit Value accurately as CR * 2 + CD", () => {
    expect(calculateCritValue(10.5, 21.0)).toBe(42.0);
    expect(calculateCritValue(3.9, 27.2)).toBe(35.0);
    expect(calculateCritValue(0, 0)).toBe(0);
  });

  it("classifies roll tiers correctly based on CV thresholds", () => {
    expect(getRollTier(45.5)).toBe("God Roll");
    expect(getRollTier(42.0)).toBe("God Roll");
    expect(getRollTier(35.5)).toBe("SS");
    expect(getRollTier(28.0)).toBe("S");
    expect(getRollTier(22.0)).toBe("A");
    expect(getRollTier(15.0)).toBe("Needs Upgrade");
  });

  it("classifies overall build tiers based on total CV", () => {
    expect(getBuildTier(245.0)).toBe("SSS Tier");
    expect(getBuildTier(215.0)).toBe("SS Tier");
    expect(getBuildTier(185.0)).toBe("S Tier");
    expect(getBuildTier(145.0)).toBe("A Tier");
    expect(getBuildTier(120.0)).toBe("Developing");
  });

  it("estimates substat rolls when exact affix IDs are unavailable", () => {
    expect(estimateRolls("CRIT Rate", 9.9)).toBe(3);
    expect(estimateRolls("CRIT DMG", 26.4)).toBe(4);
    expect(estimateRolls("Energy Recharge", 16.5)).toBe(3);
    expect(estimateRolls("Elemental Mastery", 60)).toBe(3);
  });

  it("decodes exact affix IDs when provided", () => {
    const affixIds = [1021, 1032, 1033, 1201];
    const affixesMeta = {
      "1021": { propType: "FIGHT_PROP_HP" },
      "1032": { propType: "FIGHT_PROP_HP_PERCENT" },
      "1033": { propType: "FIGHT_PROP_HP_PERCENT" },
      "1201": { propType: "FIGHT_PROP_CRITICAL" },
    };
    const counts = countRollsFromAffixIds(affixIds, affixesMeta);
    expect(counts.get("FIGHT_PROP_HP_PERCENT")).toBe(2);
    expect(counts.get("FIGHT_PROP_CRITICAL")).toBe(1);
    expect(counts.get("FIGHT_PROP_HP")).toBe(1);
  });
});

describe("build-engine: Artifact set tallying", () => {
  it("tallies 4-piece, 2-piece, and off-piece sets correctly", () => {
    const setNames = [
      "Fragment of Harmonic Whimsy",
      "Fragment of Harmonic Whimsy",
      "Fragment of Harmonic Whimsy",
      "Fragment of Harmonic Whimsy",
      "Gladiator's Finale",
    ];
    const result = tallyArtifactSets(setNames);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Fragment of Harmonic Whimsy");
    expect(result[0].count).toBe(4);
    expect(result[0].bonusSummary).toBe("4-Piece Set Bonus Active");
    expect(result[1].name).toBe("Gladiator's Finale");
    expect(result[1].count).toBe(1);
    expect(result[1].bonusSummary).toBe("Off-Piece");
  });

  it("tallies 2pc + 2pc combinations properly", () => {
    const setNames = [
      "Noblesse Oblige",
      "Noblesse Oblige",
      "Emblem of Severed Fate",
      "Emblem of Severed Fate",
      "Viridescent Venerer",
    ];
    const result = tallyArtifactSets(setNames);
    expect(result).toHaveLength(3);
    expect(result[0].bonusSummary).toBe("2-Piece Set Bonus Active");
    expect(result[1].bonusSummary).toBe("2-Piece Set Bonus Active");
    expect(result[2].bonusSummary).toBe("Off-Piece");
  });
});

describe("build-engine: Archetype detection and critique evaluation", () => {
  const dummyStats: CharacterStats = {
    maxHp: 20000,
    atk: 2100,
    baseAtk: 800,
    def: 850,
    em: 120,
    critRate: 75.0,
    critDmg: 160.0,
    er: 130.0,
    elementalDmgLabel: "Pyro DMG Bonus",
    elementalDmgBonus: 46.6,
  };

  it("detects crit-dps archetype for standard damage carries", () => {
    const artifacts: Array<{ mainStatLabel: string; slot: "Flower" | "Plume" | "Sands" | "Goblet" | "Circlet" }> = [
      { mainStatLabel: "HP", slot: "Flower" },
      { mainStatLabel: "ATK", slot: "Plume" },
      { mainStatLabel: "ATK%", slot: "Sands" },
      { mainStatLabel: "Pyro DMG Bonus", slot: "Goblet" },
      { mainStatLabel: "CRIT Rate", slot: "Circlet" },
    ];
    expect(detectScalingArchetype(artifacts, dummyStats)).toBe("crit-dps");
  });

  it("detects em-driver archetype for high EM builds (e.g. Kazuha / Sucrose)", () => {
    const artifacts: Array<{ mainStatLabel: string; slot: "Flower" | "Plume" | "Sands" | "Goblet" | "Circlet" }> = [
      { mainStatLabel: "HP", slot: "Flower" },
      { mainStatLabel: "ATK", slot: "Plume" },
      { mainStatLabel: "Elemental Mastery", slot: "Sands" },
      { mainStatLabel: "Elemental Mastery", slot: "Goblet" },
      { mainStatLabel: "Elemental Mastery", slot: "Circlet" },
    ];
    const emStats = { ...dummyStats, em: 920, critRate: 15.0, critDmg: 60.0 };
    expect(detectScalingArchetype(artifacts, emStats)).toBe("em-driver");
  });

  it("detects hp-support archetype for dedicated shielders/healers (e.g. Zhongli / Kokomi)", () => {
    const artifacts: Array<{ mainStatLabel: string; slot: "Flower" | "Plume" | "Sands" | "Goblet" | "Circlet" }> = [
      { mainStatLabel: "HP", slot: "Flower" },
      { mainStatLabel: "ATK", slot: "Plume" },
      { mainStatLabel: "HP%", slot: "Sands" },
      { mainStatLabel: "HP%", slot: "Goblet" },
      { mainStatLabel: "Healing Bonus", slot: "Circlet" },
    ];
    const hpStats: CharacterStats = {
      ...dummyStats,
      maxHp: 46000,
      critRate: 12.0,
      critDmg: 50.0,
      healingBonus: 35.9,
    };
    expect(detectScalingArchetype(artifacts, hpStats)).toBe("hp-support");
  });

  it("generates role-appropriate critique for high EM support builds", () => {
    const rawArtifacts: RawArtifactInput[] = [
      {
        slot: "Flower",
        setName: "Viridescent Venerer",
        level: 20,
        rarity: 5,
        mainStat: { label: "HP", value: 4780 },
        substats: [
          { label: "Elemental Mastery", value: 35 },
          { label: "Energy Recharge", value: 11.0, isPercent: true },
        ],
      },
      {
        slot: "Plume",
        setName: "Viridescent Venerer",
        level: 20,
        rarity: 5,
        mainStat: { label: "ATK", value: 311 },
        substats: [
          { label: "Elemental Mastery", value: 70 },
          { label: "Energy Recharge", value: 5.8, isPercent: true },
        ],
      },
      {
        slot: "Sands",
        setName: "Viridescent Venerer",
        level: 20,
        rarity: 5,
        mainStat: { label: "Elemental Mastery", value: 187 },
        substats: [{ label: "Energy Recharge", value: 16.2, isPercent: true }],
      },
      {
        slot: "Goblet",
        setName: "Viridescent Venerer",
        level: 20,
        rarity: 5,
        mainStat: { label: "Elemental Mastery", value: 187 },
        substats: [{ label: "Energy Recharge", value: 12.3, isPercent: true }],
      },
      {
        slot: "Circlet",
        setName: "Instructor",
        level: 20,
        rarity: 5,
        mainStat: { label: "Elemental Mastery", value: 187 },
        substats: [{ label: "Energy Recharge", value: 11.0, isPercent: true }],
      },
    ];

    const emStats: CharacterStats = {
      ...dummyStats,
      em: 850,
      er: 165.0,
      critRate: 15.0,
      critDmg: 60.0,
    };

    const evaluation = evaluateArtifacts(rawArtifacts, emStats);
    expect(evaluation.buildTier).toBe("Support S");
    expect(evaluation.critique).toBeDefined();
    expect(evaluation.critique?.bottleneck).toContain("EM-scaling build");
    expect(evaluation.critique?.bottleneck).toContain("Flower"); // Flower has 35 EM vs Plume 70 EM
  });

  it("identifies the weakest upgrade piece in a standard crit DPS build", () => {
    const rawArtifacts: RawArtifactInput[] = [
      {
        slot: "Flower",
        setName: "Crimson Witch of Flames",
        level: 20,
        rarity: 5,
        mainStat: { label: "HP", value: 4780 },
        substats: [
          { label: "CRIT Rate", value: 10.5, isPercent: true },
          { label: "CRIT DMG", value: 21.0, isPercent: true },
        ],
      },
      {
        slot: "Plume",
        setName: "Crimson Witch of Flames",
        level: 20,
        rarity: 5,
        mainStat: { label: "ATK", value: 311 },
        substats: [
          { label: "CRIT Rate", value: 3.9, isPercent: true },
          { label: "CRIT DMG", value: 14.0, isPercent: true }, // 21.8 CV (Weakest)
        ],
      },
      {
        slot: "Sands",
        setName: "Crimson Witch of Flames",
        level: 20,
        rarity: 5,
        mainStat: { label: "ATK%", value: 46.6, isPercent: true },
        substats: [
          { label: "CRIT Rate", value: 9.7, isPercent: true },
          { label: "CRIT DMG", value: 20.2, isPercent: true },
        ],
      },
      {
        slot: "Goblet",
        setName: "Crimson Witch of Flames",
        level: 20,
        rarity: 5,
        mainStat: { label: "Pyro DMG Bonus", value: 46.6, isPercent: true },
        substats: [
          { label: "CRIT Rate", value: 10.1, isPercent: true },
          { label: "CRIT DMG", value: 19.4, isPercent: true },
        ],
      },
      {
        slot: "Circlet",
        setName: "Gladiator's Finale",
        level: 20,
        rarity: 5,
        mainStat: { label: "CRIT Rate", value: 31.1, isPercent: true },
        substats: [{ label: "CRIT DMG", value: 24.1, isPercent: true }],
      },
    ];

    const evaluation = evaluateArtifacts(rawArtifacts, dummyStats);
    expect(evaluation.buildTier).toBe("A Tier");
    expect(evaluation.critique).toBeDefined();
    expect(evaluation.critique?.bottleneck).toContain("Plume");
    expect(evaluation.critique?.bottleneck).toContain("21.8 CV");
  });

  it("resolves exact affix rolls when affixIds and meta are supplied to evaluateArtifacts", () => {
    const rawArtifacts: RawArtifactInput[] = [
      {
        slot: "Flower",
        setName: "Emblem of Severed Fate",
        level: 20,
        rarity: 5,
        mainStat: { label: "HP", value: 4780 },
        affixIds: [1001, 1002, 1003, 1004, 1005], // 5 rolls of FIGHT_PROP_CRITICAL
        substats: [
          {
            label: "CRIT Rate",
            value: 17.5,
            isPercent: true,
            propKey: "FIGHT_PROP_CRITICAL",
          },
        ],
      },
    ];

    const affixesMeta = {
      "1001": { propType: "FIGHT_PROP_CRITICAL" },
      "1002": { propType: "FIGHT_PROP_CRITICAL" },
      "1003": { propType: "FIGHT_PROP_CRITICAL" },
      "1004": { propType: "FIGHT_PROP_CRITICAL" },
      "1005": { propType: "FIGHT_PROP_CRITICAL" },
    };

    const result = evaluateArtifacts(rawArtifacts, dummyStats, affixesMeta);
    expect(result.artifacts[0].substats[0].rolls).toBe(5);
    expect(result.artifacts[0].critValue).toBe(35.0);
    expect(result.totalCv).toBe(35.0);
  });

  it("falls back to estimated rolls when affixIds are missing in evaluateArtifacts", () => {
    const rawArtifacts: RawArtifactInput[] = [
      {
        slot: "Flower",
        setName: "Emblem of Severed Fate",
        level: 20,
        rarity: 5,
        mainStat: { label: "HP", value: 4780 },
        substats: [
          {
            label: "CRIT DMG",
            value: 26.4,
            isPercent: true,
          },
        ],
      },
    ];

    const result = evaluateArtifacts(rawArtifacts, dummyStats);
    // 26.4 / 6.6 ~= 4 rolls estimated
    expect(result.artifacts[0].substats[0].rolls).toBe(4);
    expect(result.artifacts[0].critValue).toBe(26.4);
  });
});

describe("build-engine: compareEquippedWithRecommendations", () => {
  const dummyGuide: CharacterEquipmentGuide = {
    characterName: "Arlecchino",
    element: "Pyro",
    weaponType: "Polearm",
    role: "On-Field Pyro Hypercarry",
    overview: "Normal Attack-focused Pyro DPS scaling with Bond of Life.",
    archetypes: [
      {
        id: "hypercarry",
        name: "Bond of Life Hypercarry",
        description: "Primary DPS build focusing on Whimsy 4pc and Crimson Moon's Semblance.",
        bestWeapons: [
          { name: "Crimson Moon's Semblance", rarity: 5, tier: "BiS (Signature)", reason: "Signature best-in-slot." },
          { name: "Staff of Homa", rarity: 5, tier: "Top Alternative (5★)", reason: "Competitive 5★ alternative." },
          { name: "Deathmatch", rarity: 4, tier: "Best 4★ / F2P", reason: "Accessible 4★ battle pass option." },
        ],
        bestArtifactSets: [
          { name: "Fragment of Harmonic Whimsy", type: "4-Piece", count: 4, bonusSummary: "4pc Whimsy", reason: "Signature 4pc set granting up to 54% DMG bonus." },
          { name: "Gladiator's Finale", type: "4-Piece", count: 4, bonusSummary: "4pc Glad", reason: "Alternative 4pc set for normal attack damage." },
        ],
        mainStats: {
          sands: ["ATK%"],
          goblet: ["Pyro DMG Bonus"],
          circlet: ["CRIT Rate", "CRIT DMG"],
        },
        benchmarks: {
          critRatio: "1:2 (75% / 150%+)",
          recommendedEr: "110-120%",
          keySubstats: ["CRIT Rate", "CRIT DMG", "ATK%"],
          targetNotes: "Prioritize ATK and CRIT.",
        },
        talentPriority: ["Normal Attack: Invitation to a Beheading", "Elemental Burst: Balemoon Rising"],
      },
    ],
    guideLinks: {
      game8Url: "https://game8.co",
      icyVeinsUrl: "https://icy-veins.com",
      kqmUrl: "https://keqingmains.com",
      genshinGgUrl: "https://genshin.gg",
    },
  };

  const createDummyCharacter = (
    weaponName: string,
    setNames: string[],
    er = 115,
    sands = "ATK%",
    goblet = "Pyro DMG Bonus",
    circlet = "CRIT Rate"
  ): ShowcaseCharacter =>
    createMockCharacter("Arlecchino", "Pyro", {
      avatarId: 10000096,
      title: "The Knave",
      talents: { normal: 10, skill: 10, burst: 10 },
      stats: {
        maxHp: 21000,
        atk: 2200,
        baseAtk: 910,
        def: 800,
        em: 80,
        critRate: 78.0,
        critDmg: 165.0,
        er,
      },
      weapon: createMockWeapon(weaponName, {
        rarity: weaponName === "Deathmatch" ? 4 : 5,
        baseAtk: 674,
        subStatLabel: "CRIT Rate",
        subStatValue: "22.1%",
        passiveSummary: "Passive effect",
      }),
      artifacts: createMockArtifacts(setNames, { sands, goblet, circlet }),
      artifactSets: tallyArtifactSets(setNames),
      totalCv: 149,
      buildTier: "A Tier",
    });

  it("identifies signature weapon and full 4-piece set match", () => {
    const char = createDummyCharacter(
      "Crimson Moon's Semblance",
      [
        "Fragment of Harmonic Whimsy",
        "Fragment of Harmonic Whimsy",
        "Fragment of Harmonic Whimsy",
        "Fragment of Harmonic Whimsy",
        "Gladiator's Finale",
      ],
      115
    );

    const comparison = compareEquippedWithRecommendations(char, dummyGuide);
    expect(comparison.weaponStatus).toBe("bis_match");
    expect(comparison.weaponFeedback).toContain("signature weapon");
    expect(comparison.artifactSetStatus).toBe("full_match");
    expect(comparison.artifactSetFeedback).toContain("Full 4pc set");
    expect(comparison.mainStatsStatus.sands).toBe("optimal");
    expect(comparison.mainStatsStatus.goblet).toBe("optimal");
    expect(comparison.mainStatsStatus.circlet).toBe("optimal");
    expect(comparison.erStatus).toBe("optimal");
  });

  it("identifies recommended non-signature weapon and partial artifact set match", () => {
    const char = createDummyCharacter(
      "Staff of Homa",
      [
        "Fragment of Harmonic Whimsy",
        "Fragment of Harmonic Whimsy",
        "Crimson Witch of Flames",
        "Crimson Witch of Flames",
        "Gladiator's Finale",
      ],
      115
    );

    const comparison = compareEquippedWithRecommendations(char, dummyGuide);
    expect(comparison.weaponStatus).toBe("recommended_match");
    expect(comparison.weaponFeedback).toContain("top-tier 5★ alternative");
    expect(comparison.artifactSetStatus).toBe("partial_match");
    expect(comparison.artifactSetFeedback).toContain("Running 2pc");
  });

  it("identifies alternative 5-star weapon and mismatched artifact set", () => {
    const char = createDummyCharacter(
      "Primordial Jade Winged-Spear", // Not in top 3 recommended
      [
        "Noblesse Oblige",
        "Noblesse Oblige",
        "Noblesse Oblige",
        "Noblesse Oblige",
        "Gladiator's Finale",
      ],
      115
    );

    const comparison = compareEquippedWithRecommendations(char, dummyGuide);
    expect(comparison.weaponStatus).toBe("alternative");
    expect(comparison.artifactSetStatus).toBe("mismatch");
  });

  it("identifies ER deficits and close benchmarks correctly", () => {
    // Recommended ER benchmark is 110-120%, so targetEr parses as 110.
    // ER 90 -> currentEr < 110 - 15 (95) -> deficit
    const deficitChar = createDummyCharacter("Deathmatch", ["Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Off-Piece"], 90);
    const deficitComp = compareEquippedWithRecommendations(deficitChar, dummyGuide);
    expect(deficitComp.erStatus).toBe("deficit");
    expect(deficitComp.erFeedback).toContain("below the recommended");

    // ER 108 -> currentEr < 110 - 2 (108) -> close (or <= 108)
    const closeChar = createDummyCharacter("Deathmatch", ["Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Off-Piece"], 107.5);
    const closeComp = compareEquippedWithRecommendations(closeChar, dummyGuide);
    expect(closeComp.erStatus).toBe("close");
    expect(closeComp.erFeedback).toContain("slightly below target");
  });

  it("evaluates main stat alignment accurately for optimal, acceptable, and suboptimal", () => {
    const char = createDummyCharacter(
      "Crimson Moon's Semblance",
      ["Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Fragment of Harmonic Whimsy", "Off-Piece"],
      115,
      "DEF%", // suboptimal sands (recommended: ATK%)
      "Pyro DMG Bonus", // optimal goblet
      "CRIT DMG" // acceptable circlet (recommended: CRIT Rate, then CRIT DMG)
    );

    const comparison = compareEquippedWithRecommendations(char, dummyGuide);
    expect(comparison.mainStatsStatus.sands).toBe("suboptimal");
    expect(comparison.mainStatsStatus.goblet).toBe("optimal");
    expect(comparison.mainStatsStatus.circlet).toBe("acceptable");
  });
});

describe("equipment-data: Weapon Type and Character Rarity Detection", () => {
  it("detects weapon types correctly", () => {
    const kazuha = createMockCharacter("Kaedehara Kazuha", "Anemo");
    expect(detectWeaponType(kazuha)).toBe("Sword");

    const yelan = createMockCharacter("Yelan", "Hydro", {
      weapon: createMockWeapon("Aqua Simulacra"),
    });
    expect(detectWeaponType(yelan)).toBe("Bow");

    const zhongli = createMockCharacter("Zhongli", "Geo", {
      weapon: createMockWeapon("Staff of Homa"),
    });
    expect(detectWeaponType(zhongli)).toBe("Polearm");

    const navia = createMockCharacter("Navia", "Geo", {
      weapon: createMockWeapon("Verdict"),
    });
    expect(detectWeaponType(navia)).toBe("Claymore");

    const nahida = createMockCharacter("Nahida", "Dendro", {
      weapon: createMockWeapon("A Thousand Floating Dreams"),
    });
    expect(detectWeaponType(nahida)).toBe("Catalyst");
  });

  it("detects character rarity correctly (4★ vs 5★)", () => {
    const bennett = createMockCharacter("Bennett", "Pyro");
    expect(detectCharacterRarity(bennett)).toBe(4);

    const xiangling = createMockCharacter("Xiangling", "Pyro");
    expect(detectCharacterRarity(xiangling)).toBe(4);

    const furina = createMockCharacter("Furina", "Hydro");
    expect(detectCharacterRarity(furina)).toBe(5);

    const explicitChar = createMockCharacter("Custom Char", "Anemo", { rarity: 4 });
    expect(detectCharacterRarity(explicitChar)).toBe(4);
  });
});
