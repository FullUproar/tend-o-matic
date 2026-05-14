export default function Page() {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <div className="mx-auto max-w-3xl p-8">
        <header className="flex items-baseline gap-3 border-b-2 border-kraft-700 pb-4">
          <span className="font-display text-3xl font-semibold tracking-wide text-mustard-500">
            TEND-O-MATIC
          </span>
          <span className="font-script text-xl text-clay-500">till</span>
        </header>
        <p className="mt-4 text-sm text-ink-soft">
          Phase 0 scaffold. Budtender POS lands here.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["parchment", "bg-parchment border border-kraft-700"],
            ["kraft-700", "bg-kraft-700 text-cream"],
            ["mustard-400", "bg-mustard-400 text-ink"],
            ["leaf-700", "bg-leaf-700 text-cream"],
            ["clay-500", "bg-clay-500 text-cream"],
            ["success", "bg-success text-cream"],
            ["danger", "bg-danger text-cream"],
            ["ink", "bg-ink text-cream"],
          ].map(([name, cls]) => (
            <div
              key={name}
              className={`rounded-sm px-3 py-4 text-xs font-medium ${cls}`}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
