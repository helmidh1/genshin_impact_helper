import { GoogleGenAI } from "@google/genai";
import {
  buildFallbackEquipmentAdvice,
  buildFallbackFollowUpAnswer,
  buildFallbackStrategy,
  summarizeParty,
} from "@/lib/coach-engine";
import { getEquipmentGuide } from "@/lib/equipment-data";
import { computeResonances } from "@/lib/elements";
import type {
  CoachEngineMode,
  CoachStrategyResponse,
  CoachingFocus,
  EncounterPreset,
  EquipmentCoachQueryResponse,
  ShowcaseCharacter,
} from "@/types/genshin";

const MODEL_ID = "gemini-3.8-flash";
export const GEMINI_TIMEOUT_MS = 25000;

/**
 * Bounds any asynchronous operation with a hard timeout, ensuring requests never hang indefinitely.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${Math.round(timeoutMs / 1000)}s.`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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

export function hasEnvGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

/**
 * Extracts human-readable error descriptions from Google GenAI SDK errors,
 * parsing nested API response bodies to avoid cryptic `400 API error occurred: {"httpMeta":...}` messages.
 */
export function extractGeminiErrorMessage(err: unknown): string {
  if (!err || typeof err !== "object") {
    return "Gemini request failed.";
  }

  // 1. Try to extract from body or cause.body
  const rawBody =
    ("body" in err && typeof (err as { body: unknown }).body === "string"
      ? (err as { body: string }).body
      : null) ??
    ("cause" in err &&
    typeof (err as { cause?: { body?: unknown } }).cause?.body === "string"
      ? (err as { cause: { body: string } }).cause.body
      : null);

  if (rawBody) {
    try {
      const parsed = JSON.parse(rawBody);
      const errorObj = Array.isArray(parsed) ? parsed[0]?.error : parsed?.error;
      if (errorObj?.message) {
        return errorObj.message;
      }
    } catch {
      // Ignore JSON parse error on raw body
    }
  }

  // 2. Try nested error.message
  if (
    "error" in err &&
    typeof (err as { error?: { message?: unknown } }).error?.message === "string"
  ) {
    return (err as { error: { message: string } }).error.message;
  }

  // 3. Fallback to standard Error message
  if (err instanceof Error) {
    if (err.message.includes('API error occurred: {"httpMeta"')) {
      return "Gemini API rejected request (HTTP 400). Please check your Gemini API key, permissions, or quota.";
    }
    return err.message;
  }

  return "Gemini request failed.";
}

export async function generateCoachStrategy(params: {
  party: ShowcaseCharacter[];
  encounter: EncounterPreset;
  focus: CoachingFocus;
  engineMode?: CoachEngineMode;
  apiKey?: string;
}): Promise<CoachStrategyResponse> {
  if (params.engineMode === "heuristic") {
    return buildFallbackStrategy(
      params.party,
      params.encounter,
      params.focus,
      "Generated via Local Heuristics Engine."
    );
  }

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

    const interaction = await withTimeout(
      client.interactions.create({
        model: MODEL_ID,
        system_instruction:
          "You are Teyvat Strategist, an expert Genshin Impact combat & KQM theorycraft coach. Always base advice on the exact character constellations, weapons, artifact sets, and ER/Crit stats provided. Be concise, concrete, and accurate.",
        input: prompt,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: STRATEGY_JSON_SCHEMA,
        },
      }),
      GEMINI_TIMEOUT_MS,
      "Gemini strategy generation"
    );

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
    const message = extractGeminiErrorMessage(err);
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
  activeStrategyNote?: string;
  engineMode?: CoachEngineMode;
  previousInteractionId?: string;
  apiKey?: string;
}): Promise<{ answer: string; interactionId?: string; source: "gemini" | "fallback" }> {
  if (params.engineMode === "heuristic") {
    return {
      source: "fallback",
      answer: buildFallbackFollowUpAnswer({
        ...params,
        prefix: "Offline heuristic coach",
      }),
    };
  }

  const apiKey = params.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return {
      source: "fallback",
      answer: buildFallbackFollowUpAnswer({
        ...params,
        prefix: "Offline coach mode (no Gemini API key configured)",
      }),
    };
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const strategyContext = params.activeStrategyNote
      ? `Active Strategy Summary: ${params.activeStrategyNote}\n\n`
      : "";
    const contextHeader = params.previousInteractionId
      ? ""
      : `Party context:\n${summarizeParty(params.party)}\nEncounter: ${params.encounter.name} (${params.encounter.mechanicsAlert})\n\n`;

    const interaction = await withTimeout(
      client.interactions.create({
        model: MODEL_ID,
        system_instruction:
          "You are Teyvat Strategist, an expert Genshin Impact combat coach. Answer follow-up questions concisely in plain Markdown with concrete button inputs (N3D, CA, E, Q), ICD notes, and particle funneling tips.",
        input: `${strategyContext}${contextHeader}User question: ${params.question}`,
        ...(params.previousInteractionId
          ? { previous_interaction_id: params.previousInteractionId }
          : {}),
      }),
      GEMINI_TIMEOUT_MS,
      "Gemini follow-up request"
    );

    return {
      answer: interaction.output_text ?? "No response generated.",
      interactionId: interaction.id,
      source: "gemini",
    };
  } catch (err) {
    const message = extractGeminiErrorMessage(err);
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
    const interaction = await withTimeout(
      client.interactions.create({
        model: MODEL_ID,
        system_instruction:
          "You are Teyvat Strategist's Equipment & Build Theorycraft Coach. Base your weapon rankings, artifact sets, and stat breakpoints on authoritative community standards from Game8, Icy-Veins, and KeqingMains (KQM). Evaluate the player's exact equipped weapon and stats with precise, practical, high-value advice.",
        input: prompt,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: EQUIPMENT_JSON_SCHEMA,
        },
      }),
      GEMINI_TIMEOUT_MS,
      "Gemini equipment evaluation"
    );

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
    const message = extractGeminiErrorMessage(err);
    const fallback = buildFallbackEquipmentAdvice(params);
    return {
      ...fallback,
      externalReferenceNote: `Live Gemini call fell back to Game8 & Icy-Veins heuristics (${message}).`,
    };
  }
}

