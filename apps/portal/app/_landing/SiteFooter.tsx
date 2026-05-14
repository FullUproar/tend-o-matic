export function SiteFooter() {
  return (
    <footer className="border-t-2 border-kraft-700 bg-kraft-900 text-cream/80">
      <div className="mx-auto flex max-w-6xl flex-col items-baseline justify-between gap-4 px-6 py-10 md:flex-row">
        <div>
          <div className="font-display text-xl font-bold tracking-wide text-mustard-400">
            TEND-O-MATIC
          </div>
          <p className="mt-1 text-xs text-cream/60">
            Cannabis POS · built compliance-first · MI + IL · 2026
          </p>
        </div>
        <div className="text-xs">
          <a
            href="https://github.com/FullUproar/tend-o-matic"
            className="hover:text-cream"
          >
            GitHub
          </a>{" "}
          ·{" "}
          <a href="mailto:hello@tend-o-matic.com" className="hover:text-cream">
            hello@tend-o-matic.com
          </a>
        </div>
      </div>
    </footer>
  );
}
