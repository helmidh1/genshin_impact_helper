import { describe, expect, it } from "vitest";
import {
  askCoachFollowUp,
  extractGeminiErrorMessage,
  generateCoachStrategy,
  withTimeout,
} from "@/lib/gemini";
import { ENCOUNTER_PRESETS } from "@/lib/demo-data";
import { createMockCharacter } from "@/lib/test-fixtures";

describe("extractGeminiErrorMessage", () => {
  it("extracts clean message from GoogleGenAI JSON array error body", () => {
    const errorWithArrayBody = {
      name: "BadRequestError",
      status: 400,
      body: JSON.stringify([
        {
          error: {
            code: 400,
            message: "API key not valid. Please pass a valid API key.",
            status: "INVALID_ARGUMENT",
          },
        },
      ]),
    };

    expect(extractGeminiErrorMessage(errorWithArrayBody)).toBe(
      "API key not valid. Please pass a valid API key."
    );
  });

  it("extracts clean message from GoogleGenAI JSON object error body", () => {
    const errorWithObjectBody = {
      name: "BadRequestError",
      status: 400,
      body: JSON.stringify({
        error: {
          code: 400,
          message: "User location is not supported for the API use.",
          status: "FAILED_PRECONDITION",
        },
      }),
    };

    expect(extractGeminiErrorMessage(errorWithObjectBody)).toBe(
      "User location is not supported for the API use."
    );
  });

  it("extracts clean message from cause.body", () => {
    const nestedError = {
      cause: {
        body: JSON.stringify({
          error: {
            message: "Quota exceeded for quota metric 'Generate Content API'.",
          },
        }),
      },
    };

    expect(extractGeminiErrorMessage(nestedError)).toBe(
      "Quota exceeded for quota metric 'Generate Content API'."
    );
  });

  it("converts cryptic httpMeta error string to actionable guidance", () => {
    const crypticError = new Error(
      '400 API error occurred: {"httpMeta":{"response":{},"request":{}}}'
    );

    expect(extractGeminiErrorMessage(crypticError)).toBe(
      "Gemini API rejected request (HTTP 400). Please check your Gemini API key, permissions, or quota."
    );
  });

  it("preserves standard Error messages", () => {
    const timeout = new Error("Connection timed out after 10000ms");
    expect(extractGeminiErrorMessage(timeout)).toBe(
      "Connection timed out after 10000ms"
    );
  });

  it("handles non-object inputs safely", () => {
    expect(extractGeminiErrorMessage(null)).toBe("Gemini request failed.");
    expect(extractGeminiErrorMessage(undefined)).toBe("Gemini request failed.");
    expect(extractGeminiErrorMessage("string error")).toBe(
      "Gemini request failed."
    );
  });
});

describe("withTimeout", () => {
  it("resolves promptly when promise completes before timeout threshold", async () => {
    const fastPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve("fast result"), 10)
    );
    const result = await withTimeout(fastPromise, 500, "Fast operation");
    expect(result).toBe("fast result");
  });

  it("rejects with operation name and duration when promise stalls past timeout", async () => {
    const stalledPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve("never"), 100)
    );
    await expect(
      withTimeout(stalledPromise, 20, "Gemini strategy generation")
    ).rejects.toThrow("Gemini strategy generation timed out after 0s.");
  });
});

describe("askCoachFollowUp (offline fallback)", () => {
  it("includes active rotation strategy context when provided in offline fallback mode", async () => {
    const raiden = createMockCharacter("Raiden Shogun", "Electro", {
      stats: {
        maxHp: 20000,
        atk: 1800,
        def: 800,
        em: 50,
        critRate: 65,
        critDmg: 140,
        er: 270,
      },
    });

    const reply = await askCoachFollowUp({
      question: "When should I burst?",
      party: [raiden],
      encounter: ENCOUNTER_PRESETS[0],
      activeStrategyNote: "Raiden National 21s rotation",
      apiKey: "", // empty forces offline fallback
    });

    expect(reply.source).toBe("fallback");
    expect(reply.answer).toContain("Offline coach mode");
    expect(reply.answer).toContain("Active rotation: Raiden National 21s rotation");
    expect(reply.answer).toContain("Raiden Shogun (270% ER)");
  });
});

describe("Coach Engine Mode Routing", () => {
  it("forces local heuristic fallback when engineMode is 'heuristic' even with an apiKey provided", async () => {
    const xiangling = createMockCharacter("Xiangling", "Pyro");
    const strategy = await generateCoachStrategy({
      party: [xiangling],
      encounter: ENCOUNTER_PRESETS[0],
      focus: "Optimal Rotation",
      apiKey: "dummy-key-that-would-fail-if-called",
      engineMode: "heuristic",
    });

    expect(strategy.source).toBe("fallback");
    expect(strategy.note).toContain("Generated via Local Heuristics Engine.");
  });

  it("routes follow-up chat to offline heuristic advisor when engineMode is 'heuristic'", async () => {
    const bennett = createMockCharacter("Bennett", "Pyro");
    const reply = await askCoachFollowUp({
      question: "How much ER does Bennett need?",
      party: [bennett],
      encounter: ENCOUNTER_PRESETS[0],
      apiKey: "dummy-key",
      engineMode: "heuristic",
    });

    expect(reply.source).toBe("fallback");
    expect(reply.answer).toContain("Offline heuristic coach");
  });
});
