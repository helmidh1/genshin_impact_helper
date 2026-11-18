import { compareEquippedWithRecommendations } from "@/lib/build-engine";
import {
  getEquipmentGuide,
  getMainStatsForArtifactSet,
  getWeaponsForArtifactSet,
} from "@/lib/equipment-data";
import { computeResonances, ELEMENT_THEMES } from "@/lib/elements";
import type {
  CoachStrategyResponse,
  CoachingFocus,
  CombatRole,
  EncounterPreset,
  EquipmentCoachQueryResponse,
  SavedPartySetup,
  ShowcaseCharacter,
} from "@/types/genshin";

/**
 * Pure domain theorycraft engine for team rotation synthesis, Energy Recharge (ER)
 * diagnostic evaluation, buff duration timelines, and fallback equipment coaching.
 *
 * Guaranteed zero-I/O, zero AI SDK dependencies, zero React hooks.
 */

export function buildFallbackFollowUpAnswer(params: {
  question: string;
  party: ShowcaseCharacter[];
  encounter: EncounterPreset;
  activeStrategyNote?: string;
  prefix?: string;
}): string {
  const names = params.party.map((c) => `${c.name} (${c.stats.er}% ER)`).join(", ");
  const rotationSnippet = params.activeStrategyNote
    ? ` (Active rotation: ${params.activeStrategyNote})`
    : "";
  const header = params.prefix ?? "Offline coach mode (no Gemini API key configured)";
  return `${header}: For "${params.question}"${rotationSnippet}, review your active roster (${names}) against ${params.encounter.name}. Ensure your highest-cost off-field bursts meet their ER breakpoints first, swirl your carry element before Bennett/support fields expire, and save burst windows for ${params.encounter.name}'s vulnerability phase.`;
}

export function summarizeParty(party: ShowcaseCharacter[]): string {
  return party
    .map((c, idx) => {
      const sets = c.artifactSets.map((s) => `${s.count}pc ${s.name}`).join(" + ");
      const weaponTrigger = c.weapon.name.startsWith("Favonius")
        ? " [White Particle Battery]"
        : c.weapon.name.startsWith("Sacrificial")
        ? " [Skill Reset Proc]"
        : c.weapon.name.includes("Thrilling Tales")
        ? " [TTDS +48% ATK Swap Buff]"
        : "";

      const sands = c.artifacts?.find((a) => a.slot === "Sands");
      const goblet = c.artifacts?.find((a) => a.slot === "Goblet");
      const circlet = c.artifacts?.find((a) => a.slot === "Circlet");
      const mainStats =
        sands || goblet || circlet
          ? ` | Main: Sands ${sands?.mainStatLabel ?? "N/A"} / Goblet ${goblet?.mainStatLabel ?? "N/A"} / Circlet ${circlet?.mainStatLabel ?? "N/A"}`
          : "";

      return [
        `Slot ${idx + 1}: ${c.name} (${c.element}, C${c.constellation}, Lv.${c.level})`,
        `Talents: ${c.talents.normal}/${c.talents.skill}/${c.talents.burst}`,
        `Weapon: ${c.weapon.name} R${c.weapon.refinement}${weaponTrigger}`,
        `Artifacts: ${sets || "Mixed"}`,
        `Stats: HP ${c.stats.maxHp}, ATK ${c.stats.atk}, EM ${c.stats.em}, CR ${c.stats.critRate}%, CD ${c.stats.critDmg}%, ER ${c.stats.er}% (${c.totalCv.toFixed(1)} CV)${mainStats}`,
      ].join(" | ");
    })
    .join("\n");
}

export function recommendedErFor(
  char: ShowcaseCharacter,
  party: ShowcaseCharacter[]
): number {
  const sameElementCount = party.filter((p) => p.element === char.element).length;
  const hasRaiden = party.some((p) => p.name === "Raiden Shogun");
  const favoniusTeammates = party.filter(
    (p) => p.avatarId !== char.avatarId && p.weapon.name.startsWith("Favonius")
  ).length;

  const baseMap: Record<string, number> = {
    Bennett: 210,
    Xiangling: sameElementCount >= 2 ? 195 : 230,
    Xingqiu: char.constellation >= 6 ? 175 : 200,
    Yelan: sameElementCount >= 2 ? 155 : 190,
    Furina: sameElementCount >= 2 ? 145 : 175,
    "Kaedehara Kazuha": 165,
    "Raiden Shogun": 250,
    Nahida: 125,
    Neuvillette: 120,
    Arlecchino: 115,
    Mavuika: 100,
    Skirk: 100,
    Zhongli: 130,
    Xilonen: 155,
    Citlali: 165,
    Fischl: 120,
    Clorinde: 115,
    Alhaitham: 130,
    "Hu Tao": 115,
    Xiao: sameElementCount >= 2 ? 130 : 165,
    Wanderer: 115,
    Faruzan: char.constellation >= 6 ? 185 : 240,
    Shenhe: sameElementCount >= 2 ? 175 : 205,
    Escoffier: sameElementCount >= 2 ? 150 : 185,
    Baizhu: sameElementCount >= 2 ? 165 : 200,
    Chevreuse: 170,
    "Kujou Sara": sameElementCount >= 2 ? 170 : 200,
    Mona: 200,
    Jean: 175,
    Xianyun: sameElementCount >= 2 ? 160 : 195,
    Venti: 160,
    Sucrose: 150,
    Navia: sameElementCount >= 2 ? 125 : 150,
    Lyney: 120,
    Kinich: 115,
    Mualani: 115,
    Chasca: 115,
  };

  let target = baseMap[char.name] ?? (sameElementCount >= 2 ? 140 : 165);
  if (target <= 105) {
    return 100;
  }
  if (hasRaiden && char.name !== "Raiden Shogun") {
    target -= 20;
  }
  target -= Math.min(20, favoniusTeammates * 10);
  return Math.max(100, target);
}

interface SupportProfile {
  action: string;
  notes: string;
  buffName: string;
  buffDuration: string;
}

const ON_FIELD_CARRIES = new Set([
  "Raiden Shogun",
  "Neuvillette",
  "Hu Tao",
  "Arlecchino",
  "Alhaitham",
  "Navia",
  "Mualani",
  "Kinich",
  "Xiao",
  "Kamisato Ayaka",
  "Kamisato Ayato",
  "Ganyu",
  "Yoimiya",
  "Wanderer",
  "Arataki Itto",
  "Cyno",
  "Keqing",
  "Clorinde",
  "Sethos",
  "Gaming",
  "Diluc",
  "Eula",
  "Lyney",
  "Wriothesley",
  "Tighnari",
  "Tartaglia",
  "Chasca",
  "Klee",
  "Yanfei",
  "Razor",
  "Heizou",
]);

function getCarryWindowAction(character: ShowcaseCharacter): string {
  if (character.name === "Neuvillette") {
    return "Neuvillette Charged Attack Combo Window";
  }
  if (character.name === "Raiden Shogun") {
    return "Raiden Shogun Musou Shinsetsu (Q) -> N3CA Burst / Combo Window";
  }
  if (character.name === "Hu Tao") {
    return "Hu Tao Guide to Afterlife (E) -> N2CD Vaporize Window";
  }
  if (character.name === "Arlecchino") {
    return "Arlecchino Masquerade of the Red Death (CA -> N3D) Window";
  }
  if (character.name === "Alhaitham") {
    return "Alhaitham Q -> 3-Mirror Chisel Infusion (N3D) Window";
  }
  if (character.name === "Navia") {
    return "Navia Ceremonial Crystalshot (Hold E x2) Gunbrella Window";
  }
  return `${character.name} Main Burst / Combo Window`;
}

function getSupportProfile(character: ShowcaseCharacter): SupportProfile {
  if (character.name === "Furina") {
    return {
      action: "Furina E + Q",
      notes: "Summon Salon Solitaire pets and activate Universal Revelry Fanfare buff.",
      buffName: "Furina Fanfare (18s)",
      buffDuration: "18s",
    };
  }
  if (character.name === "Bennett") {
    return {
      action: "Bennett Q + E",
      notes: "Cast Fantastic Voyage field to buff ATK and snapshot off-field Bursts.",
      buffName: "Bennett Inspiration Field (12s)",
      buffDuration: "12s",
    };
  }
  if (character.name === "Zhongli") {
    return {
      action: "Zhongli Hold E",
      notes: "Deploy Jade Shield for interruption resistance and -20% universal RES shred.",
      buffName: "Zhongli Jade Shield (20s)",
      buffDuration: "20s",
    };
  }
  if (character.name === "Nahida") {
    return {
      action: "Nahida Hold E + Q",
      notes: "Mark enemies with All Schemes to Know and deploy Maya Shrine for EM buff.",
      buffName: "Nahida Shrine of Maya (15s)",
      buffDuration: "15s",
    };
  }
  if (character.element === "Anemo") {
    return {
      action: `${character.name} Hold E + Q`,
      notes: "Trigger Swirl for -40% Viridescent Venerer RES shred.",
      buffName: `${character.name} VV Shred (10s)`,
      buffDuration: "10s",
    };
  }
  if (character.name === "Xingqiu") {
    return {
      action: "Xingqiu Q + E",
      notes: "Summon Rain Swords for continuous off-field Hydro application and damage reduction.",
      buffName: "Xingqiu Raincutters (18s)",
      buffDuration: "18s",
    };
  }
  if (character.name === "Yelan") {
    return {
      action: "Yelan Q + E",
      notes: "Cast Exquisite Throw to provide ramp-up DMG% bonus to on-field character.",
      buffName: "Yelan Exquisite Throw (15s)",
      buffDuration: "15s",
    };
  }
  if (character.name === "Xiangling") {
    return {
      action: "Xiangling Q + E",
      notes: "Snapshot Bennett ATK buff with Pyronado and deploy Guoba.",
      buffName: "Xiangling Pyronado (14s)",
      buffDuration: "14s",
    };
  }
  return {
    action: `${character.name} Q + E`,
    notes: "Snapshot / deploy off-field burst and funnel particles forward.",
    buffName: `${character.name} Burst Field / Buff`,
    buffDuration: "12s",
  };
}

function getSupportPriority(char: ShowcaseCharacter): number {
  if (
    char.name === "Zhongli" ||
    char.name === "Furina" ||
    char.name === "Baizhu" ||
    char.name === "Nahida"
  ) {
    return 1;
  }
  if (
    char.element === "Anemo" ||
    char.name === "Xilonen" ||
    char.name === "Chevreuse"
  ) {
    return 2;
  }
  if (
    char.name === "Bennett" ||
    char.name === "Kujou Sara" ||
    char.name === "Gorou" ||
    char.name === "Faruzan" ||
    char.name === "Shenhe"
  ) {
    return 3;
  }
  if (char.name === "Xingqiu" || char.name === "Yelan") {
    return 4;
  }
  if (
    char.name === "Xiangling" ||
    char.name === "Fischl" ||
    char.name === "Yae Miko" ||
    char.name === "Chiori"
  ) {
    return 5;
  }
  return 6;
}

export function buildFallbackStrategy(
  party: ShowcaseCharacter[],
  encounter: EncounterPreset,
  focus: CoachingFocus,
  note?: string
): CoachStrategyResponse {
  const names = party.map((p) => p.name).join(" • ");
  const resonances = computeResonances(party.map((p) => p.element));
  const resonanceNote =
    resonances.length > 0 ? resonances[0].name : "Rainbow Elemental Coverage";

  // Identify main on-field carry (known carry, or slot 0)
  const carry =
    party.find((p) => ON_FIELD_CARRIES.has(p.name)) ??
    party[0];

  const supports = party.filter((p) => p.avatarId !== carry?.avatarId);
  supports.sort((a, b) => getSupportPriority(a) - getSupportPriority(b));

  const steps = [
    ...(carry
      ? [
          {
            step: 1,
            timeRange: "0.0s – 2.0s",
            character: carry.name,
            element: carry.element,
            action: `${carry.name} E (Setup)`,
            notes: "Apply initial aura or stack pre-cook mechanic before support buffs.",
          },
        ]
      : []),
    ...supports.map((s, idx) => {
      const start = 2 + idx * 3;
      const end = start + 3;
      const profile = getSupportProfile(s);
      return {
        step: idx + 2,
        timeRange: `${start.toFixed(1)}s – ${end.toFixed(1)}s`,
        character: s.name,
        element: s.element,
        action: profile.action,
        notes: profile.notes,
      };
    }),
    ...(carry
      ? [
          {
            step: party.length + 1,
            timeRange: `${2 + supports.length * 3}.0s – ${10 + supports.length * 3}.0s`,
            character: carry.name,
            element: carry.element,
            action: getCarryWindowAction(carry),
            notes: `Execute full on-field combo while team buffs overlap (${focus}).`,
          },
        ]
      : []),
  ];

  const buffBars = supports.map((s, idx) => {
    const profile = getSupportProfile(s);
    return {
      name: profile.buffName,
      duration: profile.buffDuration,
      color: ELEMENT_THEMES[s.element].hex,
      startPct: Math.min(70, 12 + idx * 16),
      widthPct: 38,
    };
  });

  const energyChecks = party.map((c) => {
    const rec = recommendedErFor(c, party);
    const diff = c.stats.er - rec;
    const status: "Optimal" | "Self-Sufficient" | "Deficit" =
      diff >= 15 ? "Self-Sufficient" : diff >= -2 ? "Optimal" : "Deficit";
    return {
      character: c.name,
      element: c.element,
      currentEr: c.stats.er,
      recommendedEr: rec,
      status,
      advice:
        status === "Deficit"
          ? `${Math.abs(Math.round(diff))}% ER below target; funnel teammate Skill particles or run Favonius on a support.`
          : "Burst uptime is stable across multi-wave Abyss chambers.",
    };
  });

  return {
    teamName: `${names} (${resonanceNote})`,
    rotationDuration: "21.0s Cycle",
    estimatedDpsLabel: "Local Heuristic Mode",
    criticalNote: `Focus: ${focus} vs ${encounter.name}. ${
      party.some((p) => p.element === "Anemo")
        ? "Ensure your Anemo unit swirls your main carry's element before longer-duration support bursts expire."
        : "Keep off-field bursts aligned with the enemy's vulnerability window."
    }`,
    rotationSteps: steps,
    buffBars,
    energyChecks,
    executionCards: [
      {
        title: `${encounter.name} Matchup`,
        rule: encounter.location,
        detail: encounter.mechanicsAlert,
      },
      {
        title: `${focus} Priority`,
        rule: `${resonanceNote} Active`,
        detail:
          carry?.critique?.recommendation ??
          "Prioritize Energy Recharge breakpoints first, then balance CRIT Rate / CRIT DMG near a 1:2 ratio.",
      },
    ],
    upgradePriorities: party.map(
      (c) =>
        `${c.name}: Talents ${c.talents.normal}/${c.talents.skill}/${c.talents.burst} • ${
          c.critique?.bottleneck ?? `Current CV ${c.totalCv.toFixed(1)}`
        }`
    ),
    source: "fallback",
    note:
      note ??
      "Showing local theorycraft heuristics. Add your Gemini API key in the AI Coach setup panel (or set GEMINI_API_KEY in .env.local) for live Gemini 3.8 Flash coaching.",
  };
}

export function buildFallbackEquipmentAdvice(params: {
  character: ShowcaseCharacter;
  role?: CombatRole;
  archetypeId?: string;
  artifactSetName?: string;
  question?: string;
}): EquipmentCoachQueryResponse {
  const guide = getEquipmentGuide(params.character, params.role);
  const archetype =
    guide.archetypes.find((a) => a.id === params.archetypeId) ??
    guide.archetypes[0];

  const targetSet = params.artifactSetName
    ? archetype.bestArtifactSets.find(
        (s) =>
          s.name.toLowerCase() === params.artifactSetName?.toLowerCase() ||
          s.name.toLowerCase().includes(params.artifactSetName!.toLowerCase())
      ) ?? archetype.bestArtifactSets[0]
    : archetype.bestArtifactSets[0];

  const comparison = compareEquippedWithRecommendations(
    params.character,
    guide,
    archetype.id,
    targetSet.name
  );

  const weapons = getWeaponsForArtifactSet(archetype, targetSet.name);
  const bestWeapon = weapons[0] ?? archetype.bestWeapons[0];
  const f2pWeapon =
    weapons.find((w) => w.tier === "Best 4★ / F2P") ??
    weapons[1] ??
    bestWeapon;
  const mainStats = getMainStatsForArtifactSet(archetype, targetSet.name);

  const q = params.question?.trim().toLowerCase() ?? "";

  let tailoredSummary = `Equipment Analysis for ${params.character.name} optimizing for 4pc ${targetSet.name}: Evaluated against current community meta builds (Game8, Icy-Veins, and KeqingMains standards).`;
  if (q.includes("f2p") || q.includes("free") || q.includes("craftable") || q.includes("budget")) {
    tailoredSummary = `F2P & Budget Equipment Guide for ${params.character.name} (${targetSet.name}): Top accessible recommendations focusing on craftable, event, and 3★/4★ weapons that deliver near-5★ performance with this set.`;
  } else if (q.includes("compare") || q.includes("my gear") || q.includes("verdict")) {
    tailoredSummary = `Current Loadout Review for ${params.character.name}: Comparing your equipped ${params.character.weapon.name} and active artifact sets directly to the 4pc ${targetSet.name} meta setup.`;
  } else if (q.includes("artifact") || q.includes("set") || q.includes("weapon")) {
    tailoredSummary = `Artifact & Weapon Synergy Review for ${params.character.name}: Tailored weapon rankings and stat goals optimized around 4pc ${targetSet.name}.`;
  }

  const weaponAdvice =
    comparison.weaponStatus === "bis_match"
      ? `Your equipped ${params.character.weapon.name} (R${params.character.weapon.refinement}) is the top-ranked choice for 4pc ${targetSet.name} according to Game8 & Icy-Veins. Focus refinements or leveling to Lv.90/90.`
      : comparison.weaponStatus === "recommended_match"
      ? `Your equipped ${params.character.weapon.name} is a strong recommended pick for 4pc ${targetSet.name}. If seeking the absolute ceiling, target ${bestWeapon.name}. For F2P alternatives, ${f2pWeapon.name} is top tier.`
      : `For 4pc ${targetSet.name}, the top recommendation is ${bestWeapon.name} (${bestWeapon.tier} — ${bestWeapon.reason}). Top accessible 4★ alternative is ${f2pWeapon.name}.`;

  const artifactAdvice =
    comparison.artifactSetStatus === "full_match"
      ? `Great artifact synergy! Your equipped pieces match the active target build (${targetSet.name}). Ensure your Sands, Goblet, and Circlet have optimal main stats.`
      : `Target build is 4pc ${targetSet.name} (${targetSet.bonusSummary}). If currently farming, a 2pc + 2pc combination (${archetype.bestArtifactSets.find((s) => s.type === "2-Piece Combo")?.name ?? "ATK% + Elemental DMG"}) is a competitive transitional bridge.`;

  const statPriorityAdvice = `Main Stats for ${targetSet.name}: Sands (${mainStats.sands.join(" / ")}), Goblet (${mainStats.goblet.join(" / ")}), Circlet (${mainStats.circlet.join(" / ")}). Substat Target: ${archetype.benchmarks.keySubstats.join(" > ")}. Target ER: ${archetype.benchmarks.recommendedEr}.`;

  const comparisonVerdict = `${comparison.weaponFeedback} ${comparison.artifactSetFeedback} ${comparison.erFeedback}`;

  const actionableNextSteps = [
    `Verify Sands main stat is ${mainStats.sands[0]} and Goblet is ${mainStats.goblet[0]}.`,
    `Aim for ${archetype.benchmarks.critRatio} while maintaining at least ${archetype.benchmarks.recommendedEr}.`,
    `Pair 4pc ${targetSet.name} with ${bestWeapon.name} or ${f2pWeapon.name} for optimal damage scaling.`,
    `Cross-reference detailed weapon rankings and rotation notes on the Game8 and Icy-Veins build guides linked above.`,
  ];

  return {
    characterName: params.character.name,
    archetypeName: archetype.name,
    selectedArtifactSetName: targetSet.name,
    summary: tailoredSummary,
    weaponAdvice,
    artifactAdvice,
    statPriorityAdvice,
    comparisonVerdict,
    actionableNextSteps,
    externalReferenceNote:
      "Curated from Game8 and Icy-Veins community consensus. Add your Gemini API key in the AI Coach setup panel for dynamic live inquiries.",
    source: "fallback",
  };
}

export interface MetaTeamPreset {
  id: string;
  name: string;
  archetype: string;
  characterNames: [string, string, string, string];
  description: string;
}

export const META_TEAM_PRESETS: MetaTeamPreset[] = [
  {
    id: "raiden-national",
    name: "Raiden National (Rational)",
    archetype: "Vaporize / Overload",
    characterNames: ["Raiden Shogun", "Xiangling", "Xingqiu", "Bennett"],
    description: "Benchmark continuous burst battery and multi-reaction engine.",
  },
  {
    id: "arlecchino-vape",
    name: "Arlecchino Vaporize",
    archetype: "Vaporize",
    characterNames: ["Arlecchino", "Xingqiu", "Bennett", "Zhongli"],
    description: "Consistent forward Blood-Debt burst-normal attack vaporize rotations.",
  },
  {
    id: "raiden-furina-overvape",
    name: "Raiden Furina Overvape",
    archetype: "Electro-Charged / Vaporize",
    characterNames: ["Raiden Shogun", "Furina", "Kaedehara Kazuha", "Bennett"],
    description: "High frontload Musou no Hitotachi empowered by Fanfare and Inspiration Field.",
  },
  {
    id: "arlecchino-mono-pyro",
    name: "Arlecchino Mono Pyro",
    archetype: "Mono Pyro",
    characterNames: ["Arlecchino", "Kaedehara Kazuha", "Xiangling", "Bennett"],
    description: "Pure Pyro damage amplification through VV shred and double ATK buffers.",
  },
  {
    id: "childe-international",
    name: "Childe International",
    archetype: "Forward Vaporize / Swirl",
    characterNames: ["Tartaglia", "Kaedehara Kazuha", "Xiangling", "Bennett"],
    description: "High-ceiling quadratic scaling Riptide and Pyronado AoE team.",
  },
  {
    id: "hu-tao-double-hydro",
    name: "Hu Tao Double Hydro",
    archetype: "Vaporize",
    characterNames: ["Hu Tao", "Yelan", "Xingqiu", "Zhongli"],
    description: "Uninterrupted single-target vaporize with Hydro resonance and shield shred.",
  },
  {
    id: "arlecchino-chevreuse",
    name: "Arlecchino Chevreuse Overload",
    archetype: "Chevreuse Overload",
    characterNames: ["Arlecchino", "Chevreuse", "Fischl", "Bennett"],
    description: "40% Pyro/Electro shred without Anemo via Chevreuse passive.",
  },
  {
    id: "mavuika-nightsoul-hyper",
    name: "Mavuika Nightsoul Hyper",
    archetype: "Nightsoul / Vaporize",
    characterNames: ["Mavuika", "Furina", "Xilonen", "Bennett"],
    description: "Natlan Nightsoul burst scaling amplified by Fanfare and Cinder City.",
  },
  {
    id: "alhaitham-quickbloom",
    name: "Alhaitham Quickbloom",
    archetype: "Quickbloom",
    characterNames: ["Alhaitham", "Nahida", "Xingqiu", "Kuki Shinobu"],
    description: "Hybrid Spread-Hyperbloom reaction engine with consistent Chisel-Light mirrors.",
  },
  {
    id: "neuvillette-hyper",
    name: "Neuvillette Hypercarry",
    archetype: "Charged Attack Hyper",
    characterNames: ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"],
    description: "Draconic Glory stacking with Fanfare and VV shred powering continuous beams.",
  },
  {
    id: "ayaka-premium-freeze",
    name: "Ayaka Premium Freeze",
    archetype: "Permafrost Freeze",
    characterNames: ["Kamisato Ayaka", "Shenhe", "Kaedehara Kazuha", "Sangonomiya Kokomi"],
    description: "High frontload Soumetsu blizzard with Shenhe quills and 100% frozen uptime.",
  },
  {
    id: "navia-geo-resonance",
    name: "Navia Crystallize Cannon",
    archetype: "Crystallize Geo Resonance",
    characterNames: ["Navia", "Zhongli", "Xiangling", "Bennett"],
    description: "Rosula Shrapnel charge generation with Pyro off-field application.",
  },
  {
    id: "clorinde-aggravate",
    name: "Clorinde Aggravate",
    archetype: "Aggravate",
    characterNames: ["Clorinde", "Fischl", "Nahida", "Zhongli"],
    description: "High attack-speed Bond of Life impale thrusts driving Fischl A4 passives.",
  },
  {
    id: "nilou-superbloom",
    name: "Nilou Bountiful Superbloom",
    archetype: "Bountiful Bloom",
    characterNames: ["Nilou", "Nahida", "Sangonomiya Kokomi", "Collei"],
    description: "Instantaneous Bountiful Core detonation without Pyro or Electro triggers.",
  },
  {
    id: "kinich-burgeon",
    name: "Kinich Nightsoul Burgeon",
    archetype: "Burning / Burgeon",
    characterNames: ["Kinich", "Emilie", "Dehya", "Bennett"],
    description: "Looping grapple cannon shots powered by continuous Burning uptime.",
  },
];

export function getPlayableMetaTeams(
  roster: ShowcaseCharacter[]
): MetaTeamPreset[] {
  const rosterNames = new Set(roster.map((c) => c.name));
  return META_TEAM_PRESETS.filter((preset) =>
    preset.characterNames.every((name) => rosterNames.has(name))
  );
}

export function filterSavedParties(
  parties: SavedPartySetup[],
  query: string
): SavedPartySetup[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return parties;
  return parties.filter((p) => {
    if (p.name.toLowerCase().includes(trimmed)) return true;
    return p.characterNames.some((c) => c.toLowerCase().includes(trimmed));
  });
}

export function filterMetaTeamPresets(
  presets: MetaTeamPreset[],
  query: string
): MetaTeamPreset[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return presets;
  return presets.filter((preset) => {
    if (preset.name.toLowerCase().includes(trimmed)) return true;
    if (preset.archetype.toLowerCase().includes(trimmed)) return true;
    if (preset.description.toLowerCase().includes(trimmed)) return true;
    return preset.characterNames.some((c) => c.toLowerCase().includes(trimmed));
  });
}

export function filterRosterCharacters(
  roster: ShowcaseCharacter[],
  query: string
): ShowcaseCharacter[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return roster;
  return roster.filter((char) => {
    if (char.name.toLowerCase().includes(trimmed)) return true;
    if (char.element.toLowerCase().includes(trimmed)) return true;
    return false;
  });
}
