import { notFound } from "next/navigation";
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
  const [auth] = await db.select().from(authorizations)
    .where(eq(authorizations.runId, id));

  const entries = events.map((e) => {
    const p = (e.payload ?? {}) as Record<string, unknown>;
    return {
      kind: e.kind as LedgerEntry["kind"],
      toolName: e.toolName,
      result: typeof p.result === "string" ? p.result : undefined,
      detail: (p.detail ?? null) as Record<string, unknown> | null,
    };
  });

  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-14 sm:px-10">
      <Caption run={run} status={(auth?.status ?? "pending") as MarkStatus} />

      <section className="mt-12 border-t border-rule pt-8">
        <h2 className="caption mb-3">Instruction received</h2>
        <blockquote className="font-doc text-[17px] leading-relaxed text-ink sm:text-[19px]">
          {run.brief}
        </blockquote>
      </section>

      <div className="mt-14">
        <AuthorityLedger entries={entries} />
      </div>

      <Authorization auth={auth} />
    </main>
  );
}

function Caption({
  run, status,
}: { run: { id: string; createdAt: Date }; status: MarkStatus }) {
  return (
    <header>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h1 className="font-doc text-[30px] leading-none tracking-tight text-ink sm:text-[38px]">
          Authorization record
        </h1>
        <StatusMark status={status} />
      </div>
      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-2 border-t border-rule pt-4">
        <Field label="Record" value={run.id} />
        <Field label="Opened" value={run.createdAt.toISOString().replace("T", " ").slice(0, 19) + " UTC"} />
      </dl>
    </header>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="caption">{label}</dt>
      <dd className="provenance text-muted">{value}</dd>
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
    <section className="mt-16 border-t-2 border-ink pt-8">
      <h2 className="caption mb-5">Human authorization</h2>
      <div>
        <div className="max-w-[62ch]">
          <p className="font-doc text-[17px] leading-relaxed text-ink">
            {signed ? (
              <>
                Authorized by <strong className="font-semibold">{auth.signerEmail}</strong>. The
                signature was applied by a person and the audit trail is locked. The agent did not
                and could not perform this step.
              </>
            ) : (
              <>
                Routed to <strong className="font-semibold">{auth.signerEmail}</strong> and awaiting
                their signature. Nothing is binding until they act, and no elapsed time will change
                that.
              </>
            )}
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-2">
            {auth.envelopeId && <Field label="Envelope" value={auth.envelopeId} />}
            {auth.sentAt && <Field label="Routed" value={auth.sentAt.toISOString().slice(0, 19).replace("T", " ")} />}
            {auth.signedAt && <Field label="Signed" value={auth.signedAt.toISOString().slice(0, 19).replace("T", " ")} />}
          </dl>
        </div>
      </div>
    </section>
  );
}
