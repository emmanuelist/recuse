import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="max-w-[34ch]">
          <p className="text-[15px] font-medium tracking-[-0.02em] text-ink">Recuse</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-faint">
            Built for the DevNetwork API World 2026 hackathon. Everything shown is produced by
            real API calls — there is no seeded or illustrative data anywhere in this product.
          </p>
        </div>
        <nav className="flex gap-12">
          <div className="flex flex-col gap-2.5">
            <span className="label">Product</span>
            <Link href="/records" className="text-[13.5px] text-muted transition-colors hover:text-ink">Records</Link>
            <a href="https://github.com/emmanuelist/recuse" className="text-[13.5px] text-muted transition-colors hover:text-ink">Source</a>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="label">Built on</span>
            <span className="text-[13.5px] text-muted">Foxit eSign</span>
            <span className="text-[13.5px] text-muted">Nutrient DWS</span>
            <span className="text-[13.5px] text-muted">SerpApi</span>
          </div>
        </nav>
      </div>
    </footer>
  );
}
