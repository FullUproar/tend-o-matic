export default function Page() {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <div className="mx-auto max-w-3xl p-8">
        <header className="flex items-baseline gap-3 border-b-2 border-kraft-700 pb-4">
          <span className="font-display text-3xl font-semibold tracking-wide text-mustard-500">
            TEND-O-MATIC
          </span>
          <span className="font-script text-xl text-clay-500">backoffice</span>
        </header>
        <p className="mt-4 text-sm text-ink-soft">
          Phase 0 scaffold. Manager and admin tools land here.
        </p>
      </div>
    </main>
  );
}
