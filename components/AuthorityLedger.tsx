import { RefusalBlock } from "./RefusalBlock";

/**
 * Signature component #2 — the ledger of authority.
 *
 * Permitted actions hang off a continuous rail: an unbroken track of things
 * the agent was allowed to do. The refusal breaks the rail and spans the full
 * width. The boundary is therefore structural on the page as well as in the
 * code — you can see exactly where the track stops.
 *
 * A flat activity feed would carry the same data and show none of this.
 */
export type LedgerEntry = {
  kind: "tool_call" | "tool_result" | "refusal" | "message";
  toolName?: string | null;
  result?: string;
  detail?: Record<string, unknown> | null;
};

const LABELS: Record<string, string> = {
  draft_document: "Drafted the document",
  sign_document: "Reached for the signature",
  request_authorization: "Routed to a human",
  establish_terms: "Read the terms back",
  corroborate_claim: "Checked a claim",
};

export function AuthorityLedger({ entries }: { entries: LedgerEntry[] }) {
  const rows: Array<{ call: LedgerEntry; outcome?: LedgerEntry }> = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.kind !== "tool_call") continue;
    const next = entries[i + 1];
    const outcome = next && (next.kind === "tool_result" || next.kind === "refusal") ? next : undefined;
    rows.push({ call: e, outcome });
    if (outcome) i++;
  }

  return (
    <section aria-label="Ledger of authority" className="mt-20">
      <h2 className="label mb-8">Ledger of authority</h2>
      <ol className="flex flex-col gap-5">
        {rows.map((row, i) => {
          const refused = row.outcome?.kind === "refusal";
          const label = LABELS[row.call.toolName ?? ""] ?? row.call.toolName ?? "Action";

          if (refused) {
            return (
              <li key={i} className="relative py-2">
                <RefusalBlock
                  reason={row.outcome?.result ?? ""}
                  attemptedOn={(row.outcome?.detail?.attemptedOn as string | undefined) ?? undefined}
                />
              </li>
            );
          }

          return (
            <li key={i} className="relative pl-6 sm:pl-10">
              {/* the rail: the track of permitted action */}
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-[2px] bg-granted/30 sm:left-1"
              />
              <span
                aria-hidden
                className="absolute -left-[4px] top-8 h-2.5 w-2.5 rounded-full border-2 border-ground bg-granted shadow-[0_0_12px_var(--granted)] sm:left-[-3px]"
              />
              <div className="rounded-lg border border-rule-soft bg-surface p-6 shadow-[var(--shadow-raised)] sm:p-7">
                <p className="label mb-3">{label}</p>
                <p className="max-w-[64ch] text-[14.5px] leading-relaxed text-ink">
                  {row.outcome?.result ?? "—"}
                </p>
                {row.outcome?.detail ? <Provenance detail={row.outcome.detail} /> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Provenance({ detail }: { detail: Record<string, unknown> }) {
  const shown = Object.entries(detail).filter(
    ([, v]) => typeof v === "string" || typeof v === "number",
  );
  if (shown.length === 0) return null;
  return (
    <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-1.5 border-t border-rule-soft pt-4">
      {shown.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="provenance">{k}</dt>
          <dd className="provenance text-muted">{String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}
