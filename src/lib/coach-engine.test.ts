import { describe, expect, it } from "vitest";
import {
  buildFallbackEquipmentAdvice,
  buildFallbackStrategy,
  recommendedErFor,
  summarizeParty,
} from "./coach-engine";
import type {
  ElementType,
  EncounterPreset,
  ShowcaseCharacter,
} from "@/types/genshin";

function createMockCharacter(
  name: string,
  element: ElementType,
  overrides?: Partial<ShowcaseCharacter>
): ShowcaseCharacter {
  return {
    avatarId: 10000000 + Math.floor(Math.random() * 999999),
    name,
    element,
    level: 90,
    maxLevel: 90,
    constellation: 0,
    friendship: 10,
    talents: { normal: 8, skill: 8, burst: 8 },
    weapon: {
      name: "Iron Sting",
      level: 90,
      refinement: 1,
      rarity: 4,
      baseAtk: 510,
      subStatLabel: "Elemental Mastery",
      subStatValue: "165",
      passiveSummary: "Inflicting Elemental DMG increases all DMG by 6% for 6s.",
    },
    artifactSets: [
      {
        name: "Noblesse Oblige",
        count: 4,
        bonusSummary: "Using an Elemental Burst increases all party members' ATK by 20% for 12s.",
      },
    ],
    artifacts: [
      { slot: "Flower", name: "Flower of Life", setName: "Noblesse Oblige", rarity: 5, level: 20, mainStatLabel: "HP", mainStatValue: "4780", critValue: 35.0, tier: "SS", substats: [] },
      { slot: "Plume", name: "Plume of Death", setName: "Noblesse Oblige", rarity: 5, level: 20, mainStatLabel: "ATK", mainStatValue: "311", critValue: 32.0, tier: "S", substats: [] },
      { slot: "Sands", name: "Sands of Eon", setName: "Noblesse Oblige", rarity: 5, level: 20, mainStatLabel: "ATK%", mainStatValue: "46.6%", critValue: 28.0, tier: "S", substats: [] },
      { slot: "Goblet", name: "Goblet of Eonothem", setName: "Noblesse Oblige", rarity: 5, level: 20, mainStatLabel: "Elemental DMG", mainStatValue: "46.6%", critValue: 30.0, tier: "S", substats: [] },
      { slot: "Circlet", name: "Circlet of Logos", setName: "Noblesse Oblige", rarity: 5, level: 20, mainStatLabel: "CRIT Rate", mainStatValue: "31.1%", critValue: 24.0, tier: "A", substats: [] },
    ],
    stats: {
      maxHp: 20000,
      atk: 1500,
      def: 800,
      em: 100,
      critRate: 60.0,
      critDmg: 120.0,
      er: 180.0,
    },
    totalCv: 180.0,
    buildTier: "S Tier",
    ...overrides,
  };
}

const mockEncounter: EncounterPreset = {
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
  mechanicsAlert: "Vulnerability State: Drops -50% all RES for 20s after defeating ruin minion.",
};

describe("CoachEngine: Energy Recharge (ER) Diagnostics", () => {
  it("determines correct base ER targets for specific characters", () => {
    const bennett = createMockCharacter("Bennett", "Pyro");
    expect(recommendedErFor(bennett, [bennett])).toBe(210);

    const mavuika = createMockCharacter("Mavuika", "Pyro");
    expect(recommendedErFor(mavuika, [mavuika])).toBe(100);

    const arlecchino = createMockCharacter("Arlecchino", "Pyro");
    expect(recommendedErFor(arlecchino, [arlecchino])).toBe(115);
  });

  it("adjusts Xiangling ER target based on same-element teammate presence", () => {
    const xiangling = createMockCharacter("Xiangling", "Pyro");
    const soloParty = [xiangling];
    expect(recommendedErFor(xiangling, soloParty)).toBe(230);

    const bennett = createMockCharacter("Bennett", "Pyro");
    const dualPyroParty = [xiangling, bennett];
    expect(recommendedErFor(xiangling, dualPyroParty)).toBe(195);
  });

  it("adjusts Xingqiu and Faruzan ER targets based on constellation level", () => {
    const xingqiuC0 = createMockCharacter("Xingqiu", "Hydro", { constellation: 0 });
    const xingqiuC6 = createMockCharacter("Xingqiu", "Hydro", { constellation: 6 });
    expect(recommendedErFor(xingqiuC0, [xingqiuC0])).toBe(200);
    expect(recommendedErFor(xingqiuC6, [xingqiuC6])).toBe(175);

    const faruzanC0 = createMockCharacter("Faruzan", "Anemo", { constellation: 0 });
    const faruzanC6 = createMockCharacter("Faruzan", "Anemo", { constellation: 6 });
    expect(recommendedErFor(faruzanC0, [faruzanC0])).toBe(240);
    expect(recommendedErFor(faruzanC6, [faruzanC6])).toBe(185);
  });

  it("applies Raiden Shogun flat energy discount to teammates but not herself", () => {
    const raiden = createMockCharacter("Raiden Shogun", "Electro");
    const bennett = createMockCharacter("Bennett", "Pyro", {
      weapon: { ...bennettWeaponNonFav },
    });
    const party = [raiden, bennett];

    expect(recommendedErFor(raiden, party)).toBe(250);
    // Bennett base 210 - 20 (Raiden discount) = 190
    expect(recommendedErFor(bennett, party)).toBe(190);
  });

  const bennettWeaponNonFav = {
    name: "Aquila Favonia",
    level: 90,
    refinement: 1,
    rarity: 5,
    baseAtk: 674,
    subStatLabel: "Physical DMG Bonus",
    subStatValue: "41.3%",
    passiveSummary: "ATK increased by 20%.",
  };

  it("applies Favonius weapon energy discount up to 20% cap for teammates", () => {
    const carry = createMockCharacter("Hu Tao", "Pyro", {
      weapon: {
        name: "Staff of Homa",
        level: 90,
        refinement: 1,
        rarity: 5,
        baseAtk: 608,
        subStatLabel: "CRIT DMG",
        subStatValue: "66.2%",
        passiveSummary: "HP +20%",
      },
    });
    const support1 = createMockCharacter("Xingqiu", "Hydro", {
      weapon: {
        name: "Favonius Sword",
        level: 90,
        refinement: 5,
        rarity: 4,
        baseAtk: 454,
        subStatLabel: "ER",
        subStatValue: "61.3%",
        passiveSummary: "Particles on crit",
      },
    });
    const support2 = createMockCharacter("Yelan", "Hydro", {
      weapon: {
        name: "Favonius Warbow",
        level: 90,
        refinement: 5,
        rarity: 4,
        baseAtk: 454,
        subStatLabel: "ER",
        subStatValue: "61.3%",
        passiveSummary: "Particles on crit",
      },
    });
    const support3 = createMockCharacter("Zhongli", "Geo", {
      weapon: {
        name: "Favonius Lance",
        level: 90,
        refinement: 5,
        rarity: 4,
        baseAtk: 565,
        subStatLabel: "ER",
        subStatValue: "30.6%",
        passiveSummary: "Particles on crit",
      },
    });

    // Hu Tao base 115. With 3 Favonius teammates, discount caps at -20 -> 100 (since 115 - 20 = 95 clamped to 100)
    expect(recommendedErFor(carry, [carry, support1, support2, support3])).toBe(100);

    // Support1 has 2 Favonius teammates (support2 and support3).
    // Xingqiu C0 in dual Hydro base = 200 - 20 = 180
    expect(recommendedErFor(support1, [carry, support1, support2, support3])).toBe(180);
  });

  it("clamps recommended ER at a minimum of 100", () => {
    const char = createMockCharacter("Unknown Character", "Geo");
    // Default base is 165 solo
    // If Raiden (-20) and 2 Favonius (-20) -> 125
    const raiden = createMockCharacter("Raiden Shogun", "Electro");
    const favWeapon = {
      name: "Favonius Lance",
      level: 90,
      refinement: 5,
      rarity: 4,
      baseAtk: 565,
      subStatLabel: "ER",
      subStatValue: "30.6%",
      passiveSummary: "Particles on crit",
    };
    const fav1 = createMockCharacter("Fav1", "Anemo", { weapon: favWeapon });
    const fav2 = createMockCharacter("Fav2", "Cryo", { weapon: favWeapon });
    expect(recommendedErFor(char, [char, raiden, fav1, fav2])).toBe(125);
  });
});

describe("CoachEngine: Party Summarization", () => {
  it("formats party members into standardized theorycraft summary strings", () => {
    const char1 = createMockCharacter("Arlecchino", "Pyro", {
      constellation: 2,
      talents: { normal: 10, skill: 9, burst: 9 },
      weapon: {
        name: "Crimson Moon's Semblance",
        level: 90,
        refinement: 1,
        rarity: 5,
        baseAtk: 674,
        subStatLabel: "CRIT Rate",
        subStatValue: "22.1%",
        passiveSummary: "Bond of life bonus",
      },
      artifactSets: [{ name: "Fragment of Harmonic Whimsy", count: 4 }],
      stats: {
        maxHp: 21340,
        atk: 2420,
        def: 876,
        em: 96,
        critRate: 82.4,
        critDmg: 184.2,
        er: 114.5,
      },
    });

    const summary = summarizeParty([char1]);
    expect(summary).toContain("Slot 1: Arlecchino (Pyro, C2, Lv.90)");
    expect(summary).toContain("Talents: 10/9/9");
    expect(summary).toContain("Weapon: Crimson Moon's Semblance R1");
    expect(summary).toContain("Artifacts: 4pc Fragment of Harmonic Whimsy");
    expect(summary).toContain("Stats: HP 21340, ATK 2420, EM 96, CR 82.4%, CD 184.2%, ER 114.5%");
  });
});

describe("CoachEngine: Fallback Strategy Generation", () => {
  it("generates structured rotation steps, buff bars, and energy checks", () => {
    const carry = createMockCharacter("Arlecchino", "Pyro");
    const support1 = createMockCharacter("Kaedehara Kazuha", "Anemo");
    const support2 = createMockCharacter("Yelan", "Hydro");
    const support3 = createMockCharacter("Bennett", "Pyro");
    const party = [carry, support1, support2, support3];

    const strategy = buildFallbackStrategy(party, mockEncounter, "Optimal Rotation");

    expect(strategy.source).toBe("fallback");
    expect(strategy.teamName).toContain("Arlecchino • Kaedehara Kazuha • Yelan • Bennett");
    expect(strategy.rotationDuration).toBe("21.0s Cycle");
    expect(strategy.rotationSteps.length).toBe(party.length + 1); // carry setup + 3 supports + carry burst
    expect(strategy.rotationSteps[0].action).toBe("Arlecchino E (Setup)");
    expect(strategy.rotationSteps[1].character).toBe("Kaedehara Kazuha");
    expect(strategy.rotationSteps[1].action).toContain("Hold E + Q");
    expect(strategy.rotationSteps[1].notes).toContain("Viridescent Venerer");

    // Buff bars for the 3 supports
    expect(strategy.buffBars.length).toBe(3);
    expect(strategy.buffBars[0].name).toContain("VV Shred (10s)");
    expect(strategy.buffBars[1].name).toContain("Burst Field / Buff");

    // Energy checks
    expect(strategy.energyChecks.length).toBe(4);
    const bennettCheck = strategy.energyChecks.find((e) => e.character === "Bennett");
    expect(bennettCheck).toBeDefined();
    expect(bennettCheck?.recommendedEr).toBeGreaterThan(150);

    // Execution cards & upgrade priorities
    expect(strategy.executionCards.length).toBe(2);
    expect(strategy.upgradePriorities.length).toBe(4);
  });

  it("handles empty party gracefully without crashing", () => {
    const strategy = buildFallbackStrategy([], mockEncounter, "ER & Burst Uptime");
    expect(strategy.rotationSteps).toEqual([]);
    expect(strategy.buffBars).toEqual([]);
    expect(strategy.energyChecks).toEqual([]);
    expect(strategy.source).toBe("fallback");
  });

  it("calculates energy check status and advice correctly for Deficit, Optimal, and Self-Sufficient", () => {
    // Bennett base ER is 210 in solo Pyro
    const bennettDeficit = createMockCharacter("Bennett", "Pyro", {
      stats: {
        maxHp: 20000,
        atk: 1200,
        def: 700,
        em: 50,
        critRate: 50,
        critDmg: 100,
        er: 160, // 160 - 210 = -50 -> Deficit
      },
    });

    const strategyDeficit = buildFallbackStrategy([bennettDeficit], mockEncounter, "ER & Burst Uptime");
    expect(strategyDeficit.energyChecks[0].status).toBe("Deficit");
    expect(strategyDeficit.energyChecks[0].advice).toContain("50% ER below target");

    const bennettOptimal = createMockCharacter("Bennett", "Pyro", {
      stats: {
        maxHp: 20000,
        atk: 1200,
        def: 700,
        em: 50,
        critRate: 50,
        critDmg: 100,
        er: 215, // 215 - 210 = +5 -> Optimal
      },
    });

    const strategyOptimal = buildFallbackStrategy([bennettOptimal], mockEncounter, "ER & Burst Uptime");
    expect(strategyOptimal.energyChecks[0].status).toBe("Optimal");
    expect(strategyOptimal.energyChecks[0].advice).toContain("Burst uptime is stable");

    const bennettSufficient = createMockCharacter("Bennett", "Pyro", {
      stats: {
        maxHp: 20000,
        atk: 1200,
        def: 700,
        em: 50,
        critRate: 50,
        critDmg: 100,
        er: 235, // 235 - 210 = +25 -> Self-Sufficient
      },
    });

    const strategySufficient = buildFallbackStrategy([bennettSufficient], mockEncounter, "ER & Burst Uptime");
    expect(strategySufficient.energyChecks[0].status).toBe("Self-Sufficient");
  });

  it("adapts critical note based on Anemo presence in the team", () => {
    const pyroOnly = [createMockCharacter("Arlecchino", "Pyro"), createMockCharacter("Bennett", "Pyro")];
    const withAnemo = [
      createMockCharacter("Arlecchino", "Pyro"),
      createMockCharacter("Kaedehara Kazuha", "Anemo"),
    ];

    const strategyNoAnemo = buildFallbackStrategy(pyroOnly, mockEncounter, "Optimal Rotation");
    expect(strategyNoAnemo.criticalNote).toContain("Keep off-field bursts aligned");

    const strategyAnemo = buildFallbackStrategy(withAnemo, mockEncounter, "Optimal Rotation");
    expect(strategyAnemo.criticalNote).toContain("Ensure your Anemo unit swirls your main carry's element");
  });
});

describe("CoachEngine: Fallback Equipment Advice", () => {
  it("generates tailored equipment advice and detects BiS weapons", () => {
    const arlecchino = createMockCharacter("Arlecchino", "Pyro", {
      weapon: {
        name: "Crimson Moon's Semblance",
        level: 90,
        refinement: 1,
        rarity: 5,
        baseAtk: 674,
        subStatLabel: "CRIT Rate",
        subStatValue: "22.1%",
        passiveSummary: "Bond of life bonus",
      },
      artifactSets: [
        {
          name: "Fragment of Harmonic Whimsy",
          count: 4,
          bonusSummary: "4pc Harmonic Whimsy",
        },
      ],
    });

    const advice = buildFallbackEquipmentAdvice({
      character: arlecchino,
      artifactSetName: "Fragment of Harmonic Whimsy",
      question: "What are the best F2P weapons?",
    });

    expect(advice.characterName).toBe("Arlecchino");
    expect(advice.selectedArtifactSetName).toBe("Fragment of Harmonic Whimsy");
    expect(advice.summary).toContain("F2P & Budget Equipment Guide");
    expect(advice.weaponAdvice).toContain("Crimson Moon's Semblance");
    expect(advice.artifactAdvice).toContain("Great artifact synergy");
    expect(advice.statPriorityAdvice).toContain("Sands");
    expect(advice.actionableNextSteps.length).toBeGreaterThan(0);
    expect(advice.source).toBe("fallback");
  });

  it("customizes equipment summary for comparison and synergy questions", () => {
    const arlecchino = createMockCharacter("Arlecchino", "Pyro");

    const compareAdvice = buildFallbackEquipmentAdvice({
      character: arlecchino,
      question: "Compare my gear with meta recommendations",
    });
    expect(compareAdvice.summary).toContain("Current Loadout Review");

    const synergyAdvice = buildFallbackEquipmentAdvice({
      character: arlecchino,
      question: "What is the best artifact and weapon synergy?",
    });
    expect(synergyAdvice.summary).toContain("Artifact & Weapon Synergy Review");

    const generalAdvice = buildFallbackEquipmentAdvice({
      character: arlecchino,
    });
    expect(generalAdvice.summary).toContain("Equipment Analysis for Arlecchino");
  });

  it("handles alternative weapon status when equipped weapon does not match meta BiS", () => {
    const raiden = createMockCharacter("Raiden Shogun", "Electro", {
      weapon: {
        name: "Dragon's Bane",
        level: 90,
        refinement: 1,
        rarity: 4,
        baseAtk: 454,
        subStatLabel: "Elemental Mastery",
        subStatValue: "221",
        passiveSummary: "Bane of Flame and Water",
      },
    });

    const advice = buildFallbackEquipmentAdvice({
      character: raiden,
      artifactSetName: "Emblem of Severed Fate",
    });

    expect(advice.characterName).toBe("Raiden Shogun");
    expect(advice.weaponAdvice).toContain("Engulfing Lightning");
  });
});
