import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { runs } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Records() {
  const recent = await db.select().from(runs).orderBy(desc(runs.createdAt)).limit(30);

  return (
    <main className="mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-24">
      <h1 className="display-l max-w-[18ch] text-ink">Records</h1>
      <p className="lede mt-5 max-w-[58ch]">
        Every entry is a real run against real APIs. Nothing here is seeded to make the page
        look busy.
      </p>

      {recent.length === 0 ? (
        <p className="mt-16 max-w-[52ch] text-[15px] leading-relaxed text-muted">
          No records yet. When a run happens, it appears here.
        </p>
      ) : (
        <ul className="mt-12 overflow-hidden rounded-lg border border-rule">
          {recent.map((r, i) => (
            <li key={r.id} className={i > 0 ? "border-t border-rule" : ""}>
              <Link
                href={`/runs/${r.id}`}
                className="group grid gap-2 bg-surface px-6 py-5 transition-colors hover:bg-raised sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10"
              >
                <span className="line-clamp-2 max-w-[70ch] text-[14.5px] leading-snug tracking-[-0.01em] text-ink">
                  {r.brief}
                </span>
                <span className="provenance shrink-0 sm:text-right">
                  {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
