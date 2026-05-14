// M2.5a canary: imports a value from the compliance workspace package
// to prove transpilePackages + the install command wiring work end-to-end.
// The actual budtender UI lands in M2.5b.
import { MI_2026_05_14 } from "@tend-o-matic/compliance";

export default function Page() {
  const ruleset = MI_2026_05_14;
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
          M2.5a — workspace deps live. Budtender UI lands in M2.5b.
        </p>

        <section className="mt-8 rounded-md border border-kraft-300 bg-cream p-4">
          <h2 className="font-display text-lg font-semibold text-ink">
            Loaded ruleset
          </h2>
          <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-ink-soft">version</dt>
            <dd className="font-mono">{ruleset.version}</dd>
            <dt className="text-ink-soft">jurisdiction</dt>
            <dd className="font-mono">{ruleset.jurisdiction}</dd>
            <dt className="text-ink-soft">effective from</dt>
            <dd className="font-mono">{ruleset.effectiveFrom}</dd>
            <dt className="text-ink-soft">verification status</dt>
            <dd className="font-mono">{ruleset.provenance.status}</dd>
            <dt className="text-ink-soft">customer kinds</dt>
            <dd className="font-mono">{ruleset.customerKinds.join(", ")}</dd>
            <dt className="text-ink-soft">tax block</dt>
            <dd className="font-mono">
              {ruleset.taxBlock
                ? `${ruleset.taxBlock.rates.length} rates`
                : "absent"}
            </dd>
            <dt className="text-ink-soft">equivalencies</dt>
            <dd className="font-mono">
              {Object.keys(ruleset.equivalencies).length} categories mapped
            </dd>
          </dl>
        </section>
      </div>
    </main>
  );
}
