export function Hero() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="font-script text-xl text-clay-500">
            cannabis point of sale
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-ink lg:text-6xl">
            Your budtender works faster.
            <br />
            Your compliance officer sleeps better.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Tend-O-Matic is a cannabis POS built compliance-first, by people
            who actually like the people behind the counter. The till is fast
            because the rules are baked in — not bolted on.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#demo"
              className="rounded-sm bg-leaf-700 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-cream hover:bg-leaf-600"
            >
              Request a demo
            </a>
            <a
              href="#budtender"
              className="text-sm text-ink-soft underline hover:text-ink"
            >
              Show me the till →
            </a>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ink-soft">
            Michigan launch · Illinois in flight · multi-tenant from day one
          </p>
        </div>

        <div className="relative">
          <div className="rounded-md border-2 border-kraft-700 bg-cream p-4 shadow-lg">
            <div className="border-b border-kraft-300 pb-2 text-xs uppercase tracking-widest text-ink-soft">
              Live headroom — MI_ADULT_USE
            </div>
            <div className="mt-3 space-y-3">
              <HeadroomRow label="Total flower-equivalent" used={2.13} max={2.5} unit="oz" />
              <HeadroomRow label="Concentrate" used={6.2} max={8} unit="g" />
              <HeadroomRow label="Infused mg THC" used={420} max={1600} unit="mg" />
            </div>
            <p className="mt-4 border-t border-kraft-300 pt-3 text-xs italic text-ink-soft">
              The bar your bud&shy;tender actually watches. Updates as items go
              in the cart — never a surprise refusal at tender time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeadroomRow({
  label,
  used,
  max,
  unit,
}: {
  label: string;
  used: number;
  max: number;
  unit: string;
}) {
  const pct = Math.min(100, (used / max) * 100);
  const tone =
    pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-mustard-500" : "bg-leaf-500";
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-soft">
        <span>{label}</span>
        <span className="font-mono">
          {used} / {max} {unit}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-kraft-100">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
