import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { runs } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recent = await db.select().from(runs).orderBy(desc(runs.createdAt)).limit(12);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-16 sm:px-10">
      <header className="max-w-2xl">
        <p className="caption">Recuse</p>
        <h1 className="mt-5 font-doc text-[34px] leading-[1.12] tracking-tight text-ink sm:text-[46px]">
          An agent may draft and prove.
          <br />
          <span className="text-seal">It may never authorize.</span>
        </h1>
        <p className="mt-6 font-doc text-[17px] leading-relaxed text-muted">
          Recuse drafts binding documents and is structurally refused the authority to sign them.
          Every record below is a real run against real APIs — a real document, a real attempt at
          the signature, and a real person who did or did not authorize it.
        </p>
      </header>

      <section className="mt-16 border-t border-rule pt-8">
        <h2 className="caption mb-6">Records</h2>
        {recent.length === 0 ? (
          <p className="font-doc text-[17px] text-muted">
            No records yet. Nothing is fabricated to fill this space — when a run happens, it
            appears here.
          </p>
        ) : (
          <ul>
            {recent.map((r) => (
              <li key={r.id} className="border-b border-rule-soft">
                <Link
                  href={`/runs/${r.id}`}
                  className="group grid gap-2 py-5 transition-colors hover:bg-sunk sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
                >
                  <span className="font-doc text-[16px] leading-snug text-ink line-clamp-2 group-hover:underline">
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
      </section>
    </main>
  );
}
