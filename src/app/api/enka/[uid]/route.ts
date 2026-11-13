import { NextRequest } from "next/server";
import { fetchEnkaProfile } from "@/lib/enka";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await context.params;
    const profile = await fetchEnkaProfile(uid);
    return Response.json(profile, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch Enka.Network profile.";
    const status = message.includes("valid 9-") || message.includes("Invalid UID")
      ? 400
      : message.includes("not found")
        ? 404
        : message.includes("Rate limited")
          ? 429
          : 502;
    return Response.json({ error: message }, { status });
  }
}
