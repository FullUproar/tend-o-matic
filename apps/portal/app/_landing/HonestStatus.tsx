export function HonestStatus() {
  return (
    <section id="status" className="bg-cream">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <p className="font-script text-xl text-clay-500">honest status</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-ink">
            We&rsquo;ll tell you what works. And what doesn&rsquo;t. Yet.
          </h2>
          <p className="mt-3 text-ink-soft">
            Most POS sales decks make everything look done. Ours doesn&rsquo;t.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <StatusList
            heading="Working today"
            tone="good"
            items={[
              "Compliance rules engine (MI + IL)",
              "Per-line tax attribution + ESC/POS receipts",
              "Cart-time limit headroom",
              "Inventory + Metrc package model",
              "Sales reporting + void with reason",
              "Audit log + manager override flow",
              "Regulator source watch + diff alerts",
              "Multi-tenant with row-level security",
            ]}
          />
          <StatusList
            heading="Shipping next"
            tone="soon"
            items={[
              "Natural-language product search (LLM, your inventory)",
              "Refusal recovery — auto-suggest fitting alternative",
              "Hardware: barcode scanner + receipt printer integration certs",
              "Payments: cashless ATM + ACH provider integrations",
              "Manager phone override workflow",
              "End-to-end pilot with one Michigan store (this summer)",
              "Counsel-verified ruleset citations (in progress)",
              "Illinois launch (after MI pilot)",
            ]}
          />
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm italic text-ink-soft">
          We&rsquo;re building this in the open. If you want to be the first
          Michigan store on it, we want to talk to you — and we&rsquo;ll be
          straight about what&rsquo;s ready and what isn&rsquo;t.
        </p>
      </div>
    </section>
  );
}

function StatusList({
  heading,
  tone,
  items,
}: {
  heading: string;
  tone: "good" | "soon";
  items: string[];
}) {
  const mark = tone === "good" ? "✓" : "→";
  const markColor = tone === "good" ? "text-leaf-700" : "text-clay-500";
  const border = tone === "good" ? "border-leaf-700" : "border-clay-500";
  return (
    <div className={`rounded-md border-l-4 ${border} bg-paper p-6`}>
      <div className="font-display text-xl font-bold text-ink">{heading}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className={`font-mono ${markColor}`}>{mark}</span>
            <span className="text-ink">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
