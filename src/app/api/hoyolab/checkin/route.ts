import type { NextRequest } from "next/server";
import {
  HoyolabCheckinError,
  runGenshinCheckinAction,
} from "@/lib/hoyolab-checkin";
import type { HoyolabCheckinRequest } from "@/types/genshin";

export async function POST(request: NextRequest) {
  try {
    let body: HoyolabCheckinRequest = {};
    try {
      body = (await request.json()) as HoyolabCheckinRequest;
    } catch {
      body = {};
    }

    const result = await runGenshinCheckinAction(body);
    return Response.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof HoyolabCheckinError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    const message =
      err instanceof Error
        ? err.message
        : "Failed to run HoYoLAB Genshin daily check-in.";
    const status = message.includes("Missing HoYoLAB") ? 400 : 502;
    return Response.json({ error: message }, { status });
  }
}
