import Link from "next/link";
import { desc, eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { runs, agentEvents } from "@/lib/db/schema";
import { RefusalSeal } from "@/components/RefusalSeal";
import { Pipeline } from "@/components/site/Pipeline";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [latest] = await db.select().from(runs).orderBy(desc(runs.createdAt)).limit(1);
  const events = latest
    ? await db.select().from(agentEvents).where(eq(agentEvents.runId, latest.id)).orderBy(asc(agentEvents.seq))
    : [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div aria-hidden className="pointer-events-none absolute inset-0 rule-grid" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
          <div>
            <h1 className="display-xl max-w-[15ch] text-ink">
              An agent may draft and prove.{" "}
              <span className="text-seal">It may never authorize.</span>
            </h1>
            <p className="lede mt-7 max-w-[54ch]">
              Recuse drafts binding documents, establishes what is actually in them, and is
              structurally refused the authority to sign. The refusal is enforced by the tool
              itself — not by an instruction a model can talk its way around.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/records"
                className="rounded-md bg-ink px-5 py-2.5 text-[14px] font-medium tracking-[-0.01em] text-ground transition-opacity hover:opacity-90"
              >
                See a real record
              </Link>
              <a
                href="https://github.com/emmanuelist/recuse"
                className="rounded-md border border-rule px-5 py-2.5 text-[14px] font-medium tracking-[-0.01em] text-ink transition-colors hover:bg-raised"
              >
                Read the source
              </a>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <RefusalSeal size={248} />
          </div>
        </div>
      </section>

      {/* Product proof — the actual thing, not a mockup of it */}
      {latest && (
        <section className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display-m max-w-[22ch] text-ink">What the agent actually did.</h2>
            <Link href={`/runs/${latest.id}`} className="text-[14px] text-muted transition-colors hover:text-ink">
              Open the full record →
            </Link>
          </div>
          <ol className="mt-10 overflow-hidden rounded-lg border border-rule">
            {events
              .filter((e) => e.kind === "tool_call")
              .map((e, i) => {
                const refused = events.some(
                  (x) => x.seq === e.seq + 1 && x.kind === "refusal",
                );
                return (
                  <li
                    key={e.id}
                    className={`flex items-center gap-4 border-rule px-6 py-5 ${i > 0 ? "border-t" : ""} ${refused ? "bg-seal-deep/25" : "bg-surface"}`}
                  >
                    <span className={`mono ${refused ? "text-seal" : "text-granted"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[14.5px] tracking-[-0.01em] text-ink">
                      {LABELS[e.toolName ?? ""] ?? e.toolName}
                    </span>
                    <span className={`label ${refused ? "text-seal" : "text-granted"}`}>
                      {refused ? "Refused" : "Permitted"}
                    </span>
                  </li>
                );
              })}
          </ol>
          <p className="mt-4 provenance">
            record {latest.id} · {latest.createdAt.toISOString().slice(0, 19).replace("T", " ")} UTC
          </p>
        </section>
      )}

      <Pipeline />
    </>
  );
}

const LABELS: Record<string, string> = {
  draft_document: "Drafted a real document",
  sign_document: "Reached for the signature",
  request_authorization: "Routed it to a human",
};
