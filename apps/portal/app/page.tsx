export default function Page() {
  // Portal leans harder into the brand chrome than the till does —
  // legibility under high-throughput use is less constrained here.
  return (
    <main className="min-h-screen bg-kraft-700 text-cream">
      <div className="mx-auto max-w-3xl p-8">
        <header className="rounded-sm border-2 border-mustard-400 bg-kraft-900 p-6 text-center">
          <div className="font-display text-4xl font-bold tracking-widest text-mustard-400">
            TEND·O·MATIC
          </div>
          <div className="mt-1 font-script text-2xl text-clay-300">
            point of sale
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-cream/70">
            Est. 2026 · Dispensary Systems
          </div>
        </header>
        <p className="mt-6 text-sm text-cream/80">
          Phase 0 scaffold. Super-admin and tenant onboarding land here.
        </p>
      </div>
    </main>
  );
}
