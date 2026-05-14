import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-kraft-300 bg-cream">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold tracking-wide text-mustard-500">
            TEND-O-MATIC
          </span>
          <span className="font-script text-lg text-clay-500">point of sale</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#budtender" className="text-ink-soft hover:text-ink">
            For budtenders
          </a>
          <a href="#compliance" className="text-ink-soft hover:text-ink">
            For owners
          </a>
          <a href="#status" className="text-ink-soft hover:text-ink">
            Status
          </a>
          <Link
            href="https://till.tend-o-matic.com"
            className="text-ink-soft hover:text-ink"
          >
            Sign in
          </Link>
          <a
            href="#demo"
            className="rounded-sm bg-leaf-700 px-3 py-1.5 font-semibold uppercase tracking-wide text-cream hover:bg-leaf-600"
          >
            Request demo
          </a>
        </nav>
      </div>
    </header>
  );
}
