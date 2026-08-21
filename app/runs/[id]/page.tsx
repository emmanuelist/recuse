import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { runs, agentEvents, authorizations } from "@/lib/db/schema";
import { AuthorityLedger, type LedgerEntry } from "@/components/AuthorityLedger";
import { StatusMark, type MarkStatus } from "@/components/StatusMark";

export const dynamic = "force-dynamic";

export default async function RunRecord({ params }: PageProps<"/runs/[id]">) {
  const { id } = await params;
  const [run] = await db.select().from(runs).where(eq(runs.id, id));
  if (!run) notFound();

  const events = await db.select().from(agentEvents)
    .where(eq(agentEvents.runId, id)).orderBy(asc(agentEvents.seq));
  const [auth] = await db.select().from(authorizations).where(eq(authorizations.runId, id));

  const entries: LedgerEntry[] = events.map((e) => {
    const p = (e.payload ?? {}) as Record<string, unknown>;
    return {
      kind: e.kind as LedgerEntry["kind"],
      toolName: e.toolName,
      result: typeof p.result === "string" ? p.result : undefined,
      detail: (p.detail ?? null) as Record<string, unknown> | null,
    };
  });

  const status = (auth?.status ?? "pending") as MarkStatus;
  const signed = status === "signed";

  return (
    <main className="mx-auto max-w-4xl px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <Link href="/" className="label transition-colors hover:text-ink">
        ← All records
      </Link>

      <header className="mt-10">
        <h1 className="max-w-[26ch] text-balance font-doc text-[38px] leading-[1.08] tracking-[-0.02em] text-ink sm:text-[52px]">
          {signed ? (
            <>A person authorized this. <span className="text-granted">The agent did not.</span></>
          ) : (
            <>Drafted, proved, and <span className="text-seal">stopped at the signature.</span></>
          )}
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-rule pt-6">
          <StatusMark status={status} />
          <Field label="Record" value={run.id} />
          <Field label="Opened" value={run.createdAt.toISOString().replace("T", " ").slice(0, 19) + " UTC"} />
        </div>
      </header>

      <section className="mt-14">
        <h2 className="label mb-4">Instruction received</h2>
        <blockquote className="max-w-[64ch] border-l border-rule pl-6 font-doc text-[18px] leading-relaxed text-muted sm:text-[20px]">
          {run.brief}
        </blockquote>
      </section>

      <AuthorityLedger entries={entries} />

      <Authorization auth={auth} />
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="label">{label}</span>
      <span className="provenance text-muted">{value}</span>
    </div>
  );
}

function Authorization({
  auth,
}: {
  auth?: {
    signerEmail: string; status: string; envelopeId: string | null;
    sentAt: Date | null; signedAt: Date | null;
  };
}) {
  if (!auth) return null;
  const signed = auth.status === "signed";
  return (
    <section className="mt-20 border-t border-rule pt-10">
      <h2 className="label mb-5">Human authorization</h2>
      <p className="max-w-[62ch] font-doc text-[18px] leading-relaxed text-ink sm:text-[20px]">
        {signed ? (
          <>
            Authorized by{" "}
            <strong className="font-semibold text-granted">{auth.signerEmail}</strong>. The
            signature was applied by a person and the audit trail is locked.
          </>
        ) : (
          <>
            Routed to <strong className="font-semibold text-ink">{auth.signerEmail}</strong> and
            awaiting their signature. Nothing is binding until they act, and no elapsed time will
            change that.
          </>
        )}
      </p>
      <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
        {auth.envelopeId && <Field label="Envelope" value={auth.envelopeId} />}
        {auth.sentAt && <Field label="Routed" value={auth.sentAt.toISOString().slice(0, 19).replace("T", " ")} />}
        {auth.signedAt && <Field label="Signed" value={auth.signedAt.toISOString().slice(0, 19).replace("T", " ")} />}
      </dl>
    </section>
  );
}
