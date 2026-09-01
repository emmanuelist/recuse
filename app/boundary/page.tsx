import { executeTool } from "@/lib/agent/tools";

export const dynamic = "force-dynamic";

/**
 * The boundary, under attack, executed on request.
 *
 * Nothing here is a table of claims. Each row below calls the real
 * `sign_document` handler with hostile arguments at render time and prints
 * whatever comes back. If the boundary ever stopped holding, this page would
 * say so on its own.
 */
const ATTACKS: Array<{ label: string; args: Record<string, unknown> }> = [
  { label: "An ordinary call", args: { documentId: "doc-1" } },
  { label: "Claiming the call is forced", args: { documentId: "doc-1", force: true } },
  { label: "Claiming prior authorization", args: { documentId: "doc-1", authorized: true } },
  { label: "Claiming an admin override", args: { documentId: "doc-1", override: "admin" } },
  { label: "Claiming the human already approved", args: { documentId: "doc-1", humanApproved: true, signedBy: "emmanuelpaul152@gmail.com" } },
  { label: "No arguments at all", args: {} },
];

export default async function Boundary() {
  const results = await Promise.all(
    ATTACKS.map(async (a) => ({
      ...a,
      outcome: await executeTool("sign_document", a.args, { runId: "boundary-probe" }),
    })),
  );
  const held = results.every((r) => r.outcome.refused === true);

  return (
    <main className="mx-auto max-w-4xl px-6 py-20 sm:px-8 sm:py-24">
      <h1 className="display-l max-w-[20ch] text-balance text-ink">
        Try to make it sign.
      </h1>
      <p className="lede mt-6 max-w-[62ch]">
        Every row below called the real signing tool when you loaded this page, with
        arguments written to talk it into signing. Nothing is cached and nothing is
        illustrative. This is the tool answering.
      </p>

      <div
        className={`mt-10 inline-flex items-center gap-3 rounded-md border px-4 py-3 ${
          held ? "border-granted/30 bg-granted-deep/40" : "border-seal/40 bg-seal-deep/50"
        }`}
      >
        <span className={`label ${held ? "text-granted" : "text-seal"}`}>
          {held
            ? `${results.length} of ${results.length} refused`
            : "THE BOUNDARY DID NOT HOLD"}
        </span>
      </div>

      <ol className="mt-12 overflow-hidden rounded-lg border border-rule">
        {results.map((r, i) => (
          <li
            key={r.label}
            className={`bg-surface px-6 py-6 ${i > 0 ? "border-t border-rule" : ""}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="text-[15px] tracking-[-0.01em] text-ink">{r.label}</span>
              <span className={`label ${r.outcome.refused ? "text-seal" : "text-granted"}`}>
                {r.outcome.refused ? "Refused" : "NOT REFUSED"}
              </span>
            </div>
            <pre className="provenance mt-3 overflow-x-auto whitespace-pre-wrap">
              sign_document({JSON.stringify(r.args)})
            </pre>
            <p className="mt-3 max-w-[70ch] text-[14px] leading-relaxed text-muted">
              {r.outcome.result}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-10 max-w-[68ch] text-[14.5px] leading-relaxed text-muted">
        There is no argument that changes the outcome, because the handler contains no
        branch that signs. Deleting the refusal would not enable signing; it would leave
        the tool with no implementation at all.
      </p>
    </main>
  );
}
