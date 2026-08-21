const STAGES = [
  { name: "Draft",       by: "Foxit",   text: "A real document is generated from structured data — not prose a model invented and called a contract." },
  { name: "Establish",   by: "Nutrient", text: "The document is read back deterministically. The model does not get to vouch for its own output." },
  { name: "Corroborate", by: "SerpApi",  text: "Claims the document makes about the world are checked against live web data before anyone commits." },
];

export function Pipeline() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
      <h2 className="display-m max-w-[20ch] text-ink">
        Three things the agent may do.
      </h2>
      <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-3">
        {STAGES.map((s, i) => (
          <li key={s.name} className="bg-surface p-7">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[17px] font-medium tracking-[-0.02em] text-ink">{s.name}</span>
              <span className="mono text-granted">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <p className="mt-1 text-[12.5px] font-medium tracking-[-0.01em] text-granted">{s.by}</p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-lg border border-seal/25 bg-surface p-7 shadow-[var(--shadow-seal)] sm:p-9">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[17px] font-medium tracking-[-0.02em] text-ink">Authorize</span>
          <span className="mono text-seal">—</span>
        </div>
        <p className="mt-1 text-[12.5px] font-medium tracking-[-0.01em] text-seal">Not available to the agent</p>
        <p className="mt-4 max-w-[64ch] text-[14px] leading-relaxed text-muted">
          The signing tool exists and the agent can call it. It returns a refusal, because this
          product contains no code that signs anything. A person signs, or nothing is signed —
          and that is enforced by the tool, not by an instruction in a prompt.
        </p>
      </div>
    </section>
  );
}
