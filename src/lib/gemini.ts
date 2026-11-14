import { GoogleGenAI } from "@google/genai";
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
  EncounterPreset,
  EquipmentCoachQueryResponse,
  ShowcaseCharacter,
} from "@/types/genshin";

const MODEL_ID = "gemini-3.8-flash";

const STRATEGY_JSON_SCHEMA = {
  type: "object",
  properties: {
    teamName: { type: "string" },
    rotationDuration: { type: "string" },
    estimatedDpsLabel: { type: "string" },
    criticalNote: { type: "string" },
    rotationSteps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          step: { type: "number" },
          timeRange: { type: "string" },
          character: { type: "string" },
          element: {
            type: "string",
            enum: ["Pyro", "Hydro", "Electro", "Cryo", "Dendro", "Anemo", "Geo"],
          },
          action: { type: "string" },
          notes: { type: "string" },
        },
        required: ["step", "timeRange", "character", "element", "action", "notes"],
      },
    },
    buffBars: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          duration: { type: "string" },
          color: { type: "string" },
          startPct: { type: "number" },
          widthPct: { type: "number" },
        },
        required: ["name", "duration", "color", "startPct", "widthPct"],
      },
    },
    energyChecks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          character: { type: "string" },
          element: {
            type: "string",
            enum: ["Pyro", "Hydro", "Electro", "Cryo", "Dendro", "Anemo", "Geo"],
          },
          currentEr: { type: "number" },
          recommendedEr: { type: "number" },
          status: {
            type: "string",
            enum: ["Optimal", "Self-Sufficient", "Deficit"],
          },
          advice: { type: "string" },
        },
        required: [
          "character",
          "element",
          "currentEr",
          "recommendedEr",
          "status",
          "advice",
        ],
      },
    },
    executionCards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          rule: { type: "string" },
          detail: { type: "string" },
        },
        required: ["title", "rule", "detail"],
      },
    },
    upgradePriorities: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "teamName",
    "rotationDuration",
    "estimatedDpsLabel",
    "criticalNote",
    "rotationSteps",
    "buffBars",
    "energyChecks",
    "executionCards",
    "upgradePriorities",
  ],
};

function summarizeParty(party: ShowcaseCharacter[]): string {
  return party
    .map((c, idx) => {
      const sets = c.artifactSets.map((s) => `${s.count}pc ${s.name}`).join(" + ");
      return [
        `Slot ${idx + 1}: ${c.name} (${c.element}, C${c.constellation}, Lv.${c.level})`,
        `Talents: ${c.talents.normal}/${c.talents.skill}/${c.talents.burst}`,
        `Weapon: ${c.weapon.name} R${c.weapon.refinement}`,
        `Artifacts: ${sets || "Mixed"}`,
        `Stats: HP ${c.stats.maxHp}, ATK ${c.stats.atk}, EM ${c.stats.em}, CR ${c.stats.critRate}%, CD ${c.stats.critDmg}%, ER ${c.stats.er}%`,
      ].join(" | ");
    })
    .join("\n");
}

function recommendedErFor(char: ShowcaseCharacter, party: ShowcaseCharacter[]): number {
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

  const supports = party.slice(1);
  const carry = party[0];

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
      return {
        step: idx + 2,
        timeRange: `${start.toFixed(1)}s – ${end.toFixed(1)}s`,
        character: s.name,
        element: s.element,
        action: `${s.name} ${s.element === "Anemo" ? "Hold E + Q" : "Q + E"}`,
        notes:
          s.element === "Anemo"
            ? "Trigger Swirl for -40% Viridescent Venerer RES shred."
            : "Snapshot / deploy off-field burst and funnel particles forward.",
      };
    }),
    ...(carry
      ? [
          {
            step: party.length + 1,
            timeRange: `${2 + supports.length * 3}.0s – ${10 + supports.length * 3}.0s`,
            character: carry.name,
            element: carry.element,
            action: `${carry.name} Main Burst / Combo Window`,
            notes: `Execute full on-field combo while team buffs overlap (${focus}).`,
          },
        ]
      : []),
  ];

  const buffBars = party.slice(1).map((s, idx) => ({
    name:
      s.element === "Anemo"
        ? `${s.name} VV Shred (10s)`
        : `${s.name} Burst Field / Buff`,
    duration: s.element === "Anemo" ? "10s" : "12s",
    color: ELEMENT_THEMES[s.element].hex,
    startPct: Math.min(70, 12 + idx * 16),
    widthPct: 38,
  }));

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

export function hasEnvGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function generateCoachStrategy(params: {
  party: ShowcaseCharacter[];
  encounter: EncounterPreset;
  focus: CoachingFocus;
  apiKey?: string;
}): Promise<CoachStrategyResponse> {
  const apiKey = params.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return buildFallbackStrategy(params.party, params.encounter, params.focus);
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const resonances = computeResonances(params.party.map((p) => p.element));
    const prompt = [
      `Analyze this Genshin Impact party for "${params.focus}" against "${params.encounter.name}" (${params.encounter.location}).`,
      `Enemy Mechanics: ${params.encounter.mechanicsAlert}`,
      `Enemy Resistances: ${params.encounter.resistances.map((r) => `${r.label}: ${r.value}`).join(", ")}`,
      `Active Resonances: ${resonances.map((r) => r.name).join(", ") || "None"}`,
      "",
      "Party Builds (from player stats):",
      summarizeParty(params.party),
      "",
      "Return a tight, practical, frame-aware Genshin rotation and coaching breakdown following KQM theorycraft standards. Use hex colors for buffBars (#FF5A36 Pyro, #00B4D8 Hydro, #AF52DE Electro, #70D6FF Cryo, #70E000 Dendro, #5CE1E6 Anemo, #F3C969 Geo, #D4AF37 Gold) and startPct/widthPct between 0 and 100.",
    ].join("\n");

    const interaction = await client.interactions.create({
      model: MODEL_ID,
      system_instruction:
        "You are Teyvat Strategist, an expert Genshin Impact combat & KQM theorycraft coach. Always base advice on the exact character constellations, weapons, artifact sets, and ER/Crit stats provided. Be concise, concrete, and accurate.",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: STRATEGY_JSON_SCHEMA,
      },
    });

    const rawText = interaction.output_text;
    if (!rawText) {
      throw new Error("Empty response from Gemini Interactions API.");
    }

    const parsed = JSON.parse(rawText) as Omit<
      CoachStrategyResponse,
      "source" | "interactionId"
    >;

    return {
      ...parsed,
      source: "gemini",
      interactionId: interaction.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini request failed.";
    return buildFallbackStrategy(
      params.party,
      params.encounter,
      params.focus,
      `Live Gemini call fell back to local heuristics (${message}).`
    );
  }
}

export async function askCoachFollowUp(params: {
  question: string;
  party: ShowcaseCharacter[];
  encounter: EncounterPreset;
  previousInteractionId?: string;
  apiKey?: string;
}): Promise<{ answer: string; interactionId?: string; source: "gemini" | "fallback" }> {
  const apiKey = params.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const names = params.party.map((c) => `${c.name} (${c.stats.er}% ER)`).join(", ");
    return {
      source: "fallback",
      answer: `Offline coach mode (no Gemini API key configured): For "${params.question}", review your active roster (${names}) against ${params.encounter.name}. Ensure your highest-cost off-field bursts meet their ER breakpoints first, swirl your carry element before Bennett/support fields expire, and save burst windows for ${params.encounter.name}'s vulnerability phase.`,
    };
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const contextHeader = params.previousInteractionId
      ? ""
      : `Party context:\n${summarizeParty(params.party)}\nEncounter: ${params.encounter.name} (${params.encounter.mechanicsAlert})\n\n`;

    const interaction = await client.interactions.create({
      model: MODEL_ID,
      system_instruction:
        "You are Teyvat Strategist, an expert Genshin Impact combat coach. Answer follow-up questions concisely in plain Markdown with concrete button inputs (N3D, CA, E, Q), ICD notes, and particle funneling tips.",
      input: `${contextHeader}User question: ${params.question}`,
      ...(params.previousInteractionId
        ? { previous_interaction_id: params.previousInteractionId }
        : {}),
    });

    return {
      answer: interaction.output_text ?? "No response generated.",
      interactionId: interaction.id,
      source: "gemini",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini request failed.";
    return {
      source: "fallback",
      answer: `Could not reach Gemini (${message}). Verify your Gemini API key and try again.`,
    };
  }
}

const EQUIPMENT_JSON_SCHEMA = {
  type: "object",
  properties: {
    characterName: { type: "string" },
    archetypeName: { type: "string" },
    summary: { type: "string" },
    weaponAdvice: { type: "string" },
    artifactAdvice: { type: "string" },
    statPriorityAdvice: { type: "string" },
    comparisonVerdict: { type: "string" },
    actionableNextSteps: {
      type: "array",
      items: { type: "string" },
    },
    externalReferenceNote: { type: "string" },
  },
  required: [
    "characterName",
    "archetypeName",
    "summary",
    "weaponAdvice",
    "artifactAdvice",
    "statPriorityAdvice",
    "comparisonVerdict",
    "actionableNextSteps",
    "externalReferenceNote",
  ],
};

export function buildFallbackEquipmentAdvice(params: {
  character: ShowcaseCharacter;
  archetypeId?: string;
  artifactSetName?: string;
  question?: string;
}): EquipmentCoachQueryResponse {
  const guide = getEquipmentGuide(params.character);
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

export async function askCoachEquipment(params: {
  character: ShowcaseCharacter;
  archetypeId?: string;
  artifactSetName?: string;
  question?: string;
  apiKey?: string;
}): Promise<EquipmentCoachQueryResponse> {
  const apiKey = params.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return buildFallbackEquipmentAdvice(params);
  }

  try {
    const guide = getEquipmentGuide(params.character);
    const archetype =
      guide.archetypes.find((a) => a.id === params.archetypeId) ??
      guide.archetypes[0];
    const targetSetName = params.artifactSetName || archetype.bestArtifactSets[0]?.name || "";

    const equippedSets = params.character.artifactSets
      .map((s) => `${s.count}pc ${s.name}`)
      .join(" + ");
    const equippedPieces = params.character.artifacts
      .map((p) => `${p.slot}: ${p.setName} (${p.mainStatLabel} ${p.mainStatValue}) [${p.critValue.toFixed(1)} CV]`)
      .join("\n");

    const prompt = [
      `Analyze equipment recommendations for Genshin Impact character "${params.character.name}" (${params.character.element}, Lv.${params.character.level}, C${params.character.constellation}) based on Game8 (archive guides) and Icy-Veins theorycraft standards.`,
      `Target Build Archetype: ${archetype.name} - ${archetype.description}`,
      targetSetName ? `Target Artifact Set to optimize: 4pc ${targetSetName}` : "",
      "",
      `Current Player Loadout:`,
      `- Weapon: ${params.character.weapon.name} (Lv.${params.character.weapon.level}, R${params.character.weapon.refinement}, ${params.character.weapon.rarity}★)`,
      `- Current Sets: ${equippedSets || "Mixed"}`,
      `- Current Combat Stats: HP ${params.character.stats.maxHp}, ATK ${params.character.stats.atk}, DEF ${params.character.stats.def}, EM ${params.character.stats.em}, CR ${params.character.stats.critRate}%, CD ${params.character.stats.critDmg}%, ER ${params.character.stats.er}%`,
      equippedPieces ? `- Equipped Artifacts:\n${equippedPieces}` : "",
      "",
      `User Question / Focus: ${params.question?.trim() || `Provide a comprehensive equipment evaluation, weapon ranking, and artifact priority specifically tailored for 4pc ${targetSetName || "the recommended set"}.`}`,
      "",
      "Return a structured JSON evaluation following the schema. Address weapon tiers (BiS, 5★ alternatives, top 4★/F2P) specifically synergizing with the target artifact set, Sands/Goblet/Circlet main stats, substat priority, and concrete next steps.",
    ].filter(Boolean).join("\n");

    const client = new GoogleGenAI({ apiKey });
    const interaction = await client.interactions.create({
      model: MODEL_ID,
      system_instruction:
        "You are Teyvat Strategist's Equipment & Build Theorycraft Coach. Base your weapon rankings, artifact sets, and stat breakpoints on authoritative community standards from Game8, Icy-Veins, and KeqingMains (KQM). Evaluate the player's exact equipped weapon and stats with precise, practical, high-value advice.",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: EQUIPMENT_JSON_SCHEMA,
      },
    });

    const rawText = interaction.output_text;
    if (!rawText) {
      throw new Error("Empty response from Gemini Interactions API.");
    }

    const parsed = JSON.parse(rawText) as Omit<
      EquipmentCoachQueryResponse,
      "source" | "interactionId"
    >;

    return {
      ...parsed,
      source: "gemini",
      interactionId: interaction.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini request failed.";
    const fallback = buildFallbackEquipmentAdvice(params);
    return {
      ...fallback,
      externalReferenceNote: `Live Gemini call fell back to Game8 & Icy-Veins heuristics (${message}).`,
    };
  }
}

