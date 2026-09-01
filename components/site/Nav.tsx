import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule/70 bg-ground/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Recuse home">
          <Mark />
          <span className="text-[15px] font-medium tracking-[-0.02em] text-ink">Recuse</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/records"
            className="rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            Records
          </Link>
          <Link
            href="/boundary"
            className="rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            Try to break it
          </Link>
          <a
            href="https://github.com/emmanuelist/recuse"
            className="rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            Source
          </a>
          <Link
            href="/records"
            className="ml-1 rounded-md border border-rule bg-raised px-3.5 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-rule/0 hover:bg-ink hover:text-ground"
          >
            See a record
          </Link>
        </div>
      </nav>
    </header>
  );
}

/** The mark is the seal reduced to its essential act: a ring, struck through. */
function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="var(--seal)" strokeWidth="1.6" />
      <line x1="5.5" y1="12" x2="18.5" y2="12" stroke="var(--seal)" strokeWidth="1.6" />
    </svg>
  );
}
