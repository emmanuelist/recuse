import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Foxit delivers `POST <your-url>?signature=<base64-hmac>`, where the signature
 * is HMAC-SHA-256 over the RAW request body keyed with the webhook secret.
 *
 * Verify before touching the payload. This endpoint moves an authorization to
 * "signed", which is the one state transition the agent is not allowed to cause
 * — an unverified POST here would hand any caller exactly the authority the
 * whole product exists to withhold.
 */
export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "missing_signature" | "mismatch" };

export function verifySignature(rawBody: string, signature: string | null): VerifyResult {
  const secret = process.env.FOXIT_WEBHOOK_SECRET;

  // Fail closed. A missing secret must never mean "accept everything".
  if (!secret) return { ok: false, reason: "not_configured" };
  if (!signature) return { ok: false, reason: "missing_signature" };

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64");
  } catch {
    return { ok: false, reason: "mismatch" };
  }
  if (provided.length !== expected.length) return { ok: false, reason: "mismatch" };
  return timingSafeEqual(provided, expected) ? { ok: true } : { ok: false, reason: "mismatch" };
}

/**
 * `folder_executed` is the completion event, not `folder_completed`: the latter
 * fires when parties have signed, the former when the digital signature has
 * been applied and the audit trail locked. Only the locked state is evidence.
 */
export const EXECUTED = "folder_executed";

export function statusForEvent(event: string): "pending" | "signed" | "declined" | "expired" | null {
  switch (event) {
    case EXECUTED: return "signed";
    case "folder_cancelled":
    case "folder_declined": return "declined";
    case "folder_expired": return "expired";
    case "folder_sent":
    case "folder_viewed":
    case "folder_signed":
    case "folder_completed": return "pending";
    default: return null;
  }
}
