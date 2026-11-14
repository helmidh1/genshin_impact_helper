import { describe, expect, it } from "vitest";
import { extractGeminiErrorMessage } from "@/lib/gemini";

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
