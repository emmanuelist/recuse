import { db } from "@/lib/db";
import { runs, documents, agentEvents, authorizations, extractions, corroborations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { AgentStep } from "@/lib/agent/run";

export async function createRun(brief: string): Promise<string> {
  const [row] = await db.insert(runs).values({ brief, status: "drafting" }).returning();
  return row.id;
}

export async function recordDocument(
  runId: string, title: string, foxitDocumentId: string, storageUrl: string,
): Promise<string> {
  const [row] = await db.insert(documents)
    .values({ runId, title, foxitTaskId: foxitDocumentId, storageUrl }).returning();
  return row.id;
}

/**
 * Written when the agent routes an envelope. `status` starts at "pending" and
 * is only ever moved to "signed" by the verified webhook — nothing in the agent
 * path may set it.
 */
export async function recordAuthorization(input: {
  runId: string; documentId: string; envelopeId: string; signerEmail: string;
}): Promise<void> {
  await db.insert(authorizations).values({
    runId: input.runId,
    documentId: input.documentId,
    envelopeId: input.envelopeId,
    signerEmail: input.signerEmail,
    status: "pending",
    sentAt: new Date(),
  });
}

/** Foxit document handle -> our documents.id, for the authorizations FK. */
export async function findDocumentByFoxitId(foxitId: string): Promise<string | null> {
  const [row] = await db.select({ id: documents.id }).from(documents)
    .where(eq(documents.foxitTaskId, foxitId)).limit(1);
  return row?.id ?? null;
}

export async function recordExtraction(
  runId: string, documentId: string, extracted: Record<string, unknown>,
): Promise<void> {
  await db.insert(extractions).values({ runId, documentId, extracted });
}

export async function recordCorroboration(
  runId: string, claim: string, verdict: string, evidence: unknown,
): Promise<void> {
  await db.insert(corroborations).values({ runId, claim, verdict, evidence });
}

export async function recordSteps(runId: string, steps: AgentStep[]): Promise<void> {
  if (steps.length === 0) return;
  await db.insert(agentEvents).values(
    steps.map((s, i) => ({
      runId,
      seq: i,
      kind: s.kind,
      toolName: "toolName" in s ? s.toolName : null,
      payload: s as unknown as Record<string, unknown>,
    })),
  );
}
