import { NextRequest } from "next/server";
import {
  askCoachEquipment,
  askCoachFollowUp,
  generateCoachStrategy,
  hasEnvGeminiKey,
} from "@/lib/gemini";
import type {
  CoachingFocus,
  EncounterPreset,
  ShowcaseCharacter,
} from "@/types/genshin";

interface StrategyRequestBody {
  mode: "strategy";
  party: ShowcaseCharacter[];
  encounter: EncounterPreset;
  focus: CoachingFocus;
  apiKey?: string;
}

interface FollowUpRequestBody {
  mode: "followup";
  question: string;
  party: ShowcaseCharacter[];
  encounter: EncounterPreset;
  previousInteractionId?: string;
  apiKey?: string;
}

interface EquipmentRequestBody {
  mode: "equipment";
  character: ShowcaseCharacter;
  archetypeId?: string;
  artifactSetName?: string;
  question?: string;
  apiKey?: string;
}

type CoachRequestBody =
  | StrategyRequestBody
  | FollowUpRequestBody
  | EquipmentRequestBody;

export async function GET() {
  return Response.json(
    { envConfigured: hasEnvGeminiKey() },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CoachRequestBody;

    if (!body) {
      return Response.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    if (body.mode === "equipment") {
      if (!body.character || !body.character.name) {
        return Response.json(
          { error: "Character details are required for equipment recommendations." },
          { status: 400 }
        );
      }
      const equipmentAdvice = await askCoachEquipment({
        character: body.character,
        archetypeId: body.archetypeId,
        artifactSetName: body.artifactSetName,
        question: body.question,
        apiKey: body.apiKey,
      });
      return Response.json(equipmentAdvice, { status: 200 });
    }

    if (!Array.isArray(body.party) || body.party.length === 0) {
      return Response.json(
        { error: "At least one character in the party is required." },
        { status: 400 }
      );
    }

    if (body.mode === "followup") {
      if (!body.question?.trim()) {
        return Response.json(
          { error: "Follow-up question cannot be empty." },
          { status: 400 }
        );
      }
      const result = await askCoachFollowUp({
        question: body.question.trim(),
        party: body.party,
        encounter: body.encounter,
        previousInteractionId: body.previousInteractionId,
        apiKey: body.apiKey,
      });
      return Response.json(result, { status: 200 });
    }

    const strategy = await generateCoachStrategy({
      party: body.party,
      encounter: body.encounter,
      focus: body.focus,
      apiKey: body.apiKey,
    });
    return Response.json(strategy, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to process coach request.";
    return Response.json({ error: message }, { status: 500 });
  }
}
