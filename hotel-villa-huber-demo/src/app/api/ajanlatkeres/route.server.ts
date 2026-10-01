import { NextResponse, type NextRequest } from "next/server";
import { LIMITS, normalizeInquiry, validateInquiry } from "@/features/inquiry/schema";
import { sendInquiry } from "@/features/inquiry/send.server";
import { checkSpam, rateLimited } from "@/features/inquiry/guard.server";

/**
 * POST /api/ajanlatkeres — az eladási landing ajánlatkérője.
 * Méretkorlát, honeypot + kitöltési idő, egyszerű IP-alapú korlát, szerveroldali validáció.
 * Személyes adatot nem naplóz és nem tárol.
 */
export const dynamic = "force-dynamic";

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > LIMITS.requestBytesMax) return json(413, { status: "invalid", errors: {} });
  if (!request.headers.get("content-type")?.includes("application/json")) return json(415, { status: "invalid", errors: {} });

  const raw = await request.text();
  if (raw.length > LIMITS.requestBytesMax) return json(413, { status: "invalid", errors: {} });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { status: "invalid", errors: {} });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json(429, { status: "rate_limited" });

  if (checkSpam({ website: body.website, startedAt: body.startedAt })) {
    // Robotgyanús kérés: nem továbbítjuk, és sikert sem jelzünk.
    return json(400, { status: "invalid", errors: {} });
  }

  const errors = validateInquiry(body);
  if (Object.keys(errors).length > 0) return json(422, { status: "invalid", errors });

  const result = await sendInquiry(normalizeInquiry(body));
  if (result.status === "accepted") return json(200, { status: "accepted" });
  if (result.status === "not_configured") return json(503, { status: "not_configured" });
  return json(502, { status: "failed" });
}

export function GET() {
  return json(405, { status: "method_not_allowed" });
}
