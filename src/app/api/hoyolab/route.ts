import { NextRequest } from "next/server";
import { fetchHoyolabProfile, hasEnvHoyolabCredentials } from "@/lib/hoyolab";
import type { HoyolabCredentialsPayload } from "@/types/genshin";

export async function GET() {
  return Response.json(
    { envConfigured: hasEnvHoyolabCredentials() },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: HoyolabCredentialsPayload = {};
    try {
      body = (await request.json()) as HoyolabCredentialsPayload;
    } catch {
      body = {};
    }

    const result = await fetchHoyolabProfile(body);
    return Response.json(result, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to sync HoYoLAB account.";
    const status =
      message.includes("valid 9-") || message.includes("Missing HoYoLAB")
        ? 400
        : message.includes("invalid or expired")
          ? 401
          : message.includes("private")
            ? 403
            : message.includes("rate limit")
              ? 429
              : 502;
    return Response.json({ error: message }, { status });
  }
}
