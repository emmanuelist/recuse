/**
 * Signature component #1.
 *
 * The moment the agent reaches for the signature and is refused. Rendered as an
 * institutional act — authority withheld — not as an error. It is struck onto
 * the record the way a clerk stamps a filing, because that is what happened:
 * the request was made, considered, and denied.
 *
 * Seal red appears here and nowhere else in the product.
 */
export function RefusalStamp({ reason, attemptedOn }: { reason: string; attemptedOn?: string }) {
  return (
    <div className="relative border border-seal/35 bg-seal-wash">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--seal) 0 1.5px, transparent 1.5px 8px)",
        }}
      />
      <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
        <div className="shrink-0">
          <span className="caption inline-block border-2 border-seal bg-surface px-3 py-1.5 text-[11px] text-seal -rotate-2 shadow-[2px_2px_0_var(--seal)]">
            Authority withheld
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="max-w-[42ch] font-sans text-[17px] leading-[1.55] text-ink sm:text-[18px]">{reason}</p>
          {attemptedOn && (
            <p className="provenance mt-2.5">attempted on document {attemptedOn}</p>
          )}
        </div>
      </div>
    </div>
  );
}
