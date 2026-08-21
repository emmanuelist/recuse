import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { runs } from "@/lib/db/schema";
import { RefusalSeal } from "@/components/RefusalSeal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recent = await db.select().from(runs).orderBy(desc(runs.createdAt)).limit(12);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-32 pt-16 sm:px-10 sm:pt-24">
      <div className="flex flex-col-reverse items-start gap-12 sm:flex-row sm:items-center sm:justify-between sm:gap-16">
        <div className="max-w-[34rem]">
          <h1 className="font-doc text-[40px] leading-[1.06] tracking-[-0.025em] text-ink sm:text-[58px]">
            An agent may draft and prove.
            <br />
            <span className="text-seal">It may never authorize.</span>
          </h1>
          <p className="mt-7 max-w-[52ch] font-doc text-[18px] leading-relaxed text-muted sm:text-[19px]">
            Recuse drafts binding documents and is structurally refused the authority to sign them.
            Every record below is a real run: a real document, a real attempt at the signature, and
            a real person who did or did not authorize it.
          </p>
        </div>
        <RefusalSeal size={200} />
      </div>

      <section className="mt-24">
        <h2 className="label mb-7">Records</h2>
        {recent.length === 0 ? (
          <p className="max-w-[52ch] font-doc text-[18px] leading-relaxed text-muted">
            No records yet. Nothing is fabricated to fill this space — when a run happens, it
            appears here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/runs/${r.id}`}
                  className="group grid gap-3 border border-rule-soft bg-surface p-6 shadow-[var(--shadow-raised)] transition-colors hover:border-rule hover:bg-raised sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10"
                >
                  <span className="line-clamp-2 max-w-[62ch] font-doc text-[17px] leading-snug text-ink">
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
