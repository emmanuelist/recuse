import { RefusalSeal } from "./RefusalSeal";

/** The refusal, given the weight of the moment it represents. */
export function RefusalBlock({ reason, attemptedOn }: { reason: string; attemptedOn?: string }) {
  return (
    <div className="relative overflow-hidden border border-seal/25 bg-surface shadow-[var(--shadow-seal)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(38rem 20rem at 88% 0%, var(--seal-glow) 0%, transparent 64%)",
        }}
      />
      <div className="relative flex flex-col items-start gap-8 p-8 sm:flex-row sm:items-center sm:gap-10 sm:p-10">
        <RefusalSeal />
        <div className="min-w-0">
          <p className="label mb-3 text-seal">The agent reached for the signature</p>
          <p className="max-w-[46ch] font-doc text-[19px] leading-[1.5] text-ink sm:text-[22px]">
            {reason}
          </p>
          {attemptedOn && (
            <p className="provenance mt-4">attempted on document {attemptedOn}</p>
          )}
        </div>
      </div>
    </div>
  );
}
