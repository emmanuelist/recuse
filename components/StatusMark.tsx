const MARKS = {
  pending:  { label: "Awaiting authorization", fg: "text-pending", bg: "bg-pending-wash" },
  signed:   { label: "Authorized",             fg: "text-granted", bg: "bg-granted-wash" },
  declined: { label: "Declined",               fg: "text-seal",    bg: "bg-seal-wash" },
  expired:  { label: "Expired unsigned",       fg: "text-muted",   bg: "bg-sunk" },
} as const;

export type MarkStatus = keyof typeof MARKS;

export function StatusMark({ status }: { status: MarkStatus }) {
  const m = MARKS[status] ?? MARKS.pending;
  return (
    <span className={`caption inline-flex items-center gap-2 border border-current/25 px-3 py-2 ${m.bg} ${m.fg}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}
