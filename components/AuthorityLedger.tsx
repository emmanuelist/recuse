import { RefusalStamp } from "./RefusalStamp";

/**
 * Signature component #2 — the authority ledger.
 *
 * Every action the agent took sits on one side of a spine: PERMITTED to the
 * left, ATTEMPTED to the right. The boundary is therefore spatial. You watch
 * the agent work down the permitted side, cross to the right, and stop.
 *
 * A dashboard would render this as a flat activity feed and the central claim
 * would be invisible. The whole point is that some of these are not alike.
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
  // Pair each call with whatever came back from it.
  const rows: Array<{ call: LedgerEntry; outcome?: LedgerEntry }> = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.kind === "tool_call") {
      const next = entries[i + 1];
      const outcome =
        next && (next.kind === "tool_result" || next.kind === "refusal") ? next : undefined;
      rows.push({ call: e, outcome });
      if (outcome) i++;
    }
  }

  return (
    <section aria-label="Authority ledger">
      {/* The two-column framing only exists above sm. On a phone the columns
          collapse, so naming them there would describe a structure that is not
          on screen; the per-entry labels carry it instead, seal-coloured when
          the action was attempted rather than permitted. */}
      <header className="border-b border-rule pb-3">
        <div className="hidden grid-cols-[1fr_auto_1fr] items-end gap-4 sm:grid">
          <h2 className="caption">Permitted</h2>
          <span aria-hidden className="caption text-faint">│</span>
          <h2 className="caption text-right text-seal">Attempted</h2>
        </div>
        <h2 className="caption sm:hidden">Ledger of authority</h2>
      </header>

      <ol className="relative">
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-rule sm:block"
        />
        {rows.map((row, i) => {
          const refused = row.outcome?.kind === "refusal";
          const label = LABELS[row.call.toolName ?? ""] ?? row.call.toolName ?? "Action";
          return (
            <li
              key={i}
              className={`relative grid gap-3 py-7 last:pb-0 sm:gap-10 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-rule-soft ${refused ? "sm:grid-cols-[1fr_2fr]" : "sm:grid-cols-2 sm:gap-12"}`}
            >
              {refused ? (
                <>
                  {/* Marginalia: the consequence of the refusal, set as a note
                      in the margin the way a clerk annotates a filing. Fills
                      what would otherwise be dead space with the point. */}
                  <aside className="hidden sm:flex sm:items-center sm:justify-end sm:pr-2">
                    <p className="max-w-[14rem] text-right font-doc text-[14px] italic leading-relaxed text-faint">
                      Nothing crossed this line. The document exists, but it binds no one
                      until a person says so.
                    </p>
                  </aside>
                  <div>
                    <p className="caption mb-2.5 text-seal">{label}</p>
                    <RefusalStamp
                      reason={row.outcome?.result ?? ""}
                      attemptedOn={
                        (row.outcome?.detail?.attemptedOn as string | undefined) ?? undefined
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="sm:pr-2">
                    <p className="caption mb-2">{label}</p>
                    <p className="font-doc text-[15px] leading-relaxed text-ink">
                      {row.outcome?.result ?? "—"}
                    </p>
                    {row.outcome?.detail ? <Provenance detail={row.outcome.detail} /> : null}
                  </div>
                  <div className="hidden sm:block" />
                </>
              )}
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
    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
      {shown.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="provenance">{k}</dt>
          <dd className="provenance text-muted">{String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}
