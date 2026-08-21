const MARKS = {
  pending:  { label: "Awaiting authorization", fg: "text-pending", ring: "border-pending/35", bg: "bg-pending-deep/70" },
  signed:   { label: "Authorized by a person", fg: "text-granted", ring: "border-granted/35", bg: "bg-granted-deep/70" },
  declined: { label: "Declined",               fg: "text-seal",    ring: "border-seal/35",    bg: "bg-seal-deep/70" },
  expired:  { label: "Expired unsigned",       fg: "text-faint",   ring: "border-rule",       bg: "bg-raised" },
} as const;

export type MarkStatus = keyof typeof MARKS;

export function StatusMark({ status }: { status: MarkStatus }) {
  const m = MARKS[status] ?? MARKS.pending;
  return (
    <span className={`label inline-flex items-center gap-2.5 border px-3.5 py-2.5 ${m.ring} ${m.bg} ${m.fg}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}
