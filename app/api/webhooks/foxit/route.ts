import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { authorizations, runs } from "@/lib/db/schema";
import { verifySignature, statusForEvent, EXECUTED } from "@/lib/foxit/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Raw body first — parsing before verifying would defeat the point.
  const raw = await request.text();
  const signature = new URL(request.url).searchParams.get("signature");

  const verified = verifySignature(raw, signature);
  if (!verified.ok) {
    // Deliberately terse: do not tell an unverified caller why they failed.
    console.warn(`[foxit-webhook] rejected: ${verified.reason}`);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const event = String(payload.event ?? payload.eventType ?? "");
  const folderId = String(
    payload.folderId ?? (payload.folder as Record<string, unknown>)?.folderId ?? "",
  );
  if (!folderId) return NextResponse.json({ error: "no folderId" }, { status: 400 });

  const status = statusForEvent(event);
  if (!status) {
    // Unknown events are acknowledged, not failed: Foxit will retry a non-2xx
    // forever for an event we simply do not model.
    return NextResponse.json({ ok: true, ignored: event });
  }

  const [row] = await db
    .update(authorizations)
    .set({
      status,
      webhookPayload: payload,
      ...(event === EXECUTED ? { signedAt: new Date() } : {}),
    })
    .where(eq(authorizations.envelopeId, folderId))
    .returning();

  if (!row) {
    console.warn(`[foxit-webhook] no authorization for folder ${folderId}`);
    return NextResponse.json({ ok: true, unmatched: folderId });
  }

  if (event === EXECUTED) {
    await db.update(runs).set({ status: "authorized", updatedAt: new Date() })
      .where(eq(runs.id, row.runId));
  }

  return NextResponse.json({ ok: true, event, status });
}

/** Foxit's portal may probe the URL before saving it. */
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "foxit-webhook" });
}
