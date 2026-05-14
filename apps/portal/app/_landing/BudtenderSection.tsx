export function BudtenderSection() {
  return (
    <section id="budtender" className="border-t-2 border-kraft-300 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="font-script text-xl text-clay-500">for your budtender</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-ink">
            The till stops being the thing that slows down the line.
          </h2>
          <p className="mt-5 text-lg text-ink-soft">
            Most POS systems treat the budtender like a data-entry clerk. We
            treat them like the expert they already are — and give them tools
            that make them look it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <FeatureCard
            kicker="live headroom"
            title="No surprise refusals"
            body="Every limit the customer is bumping against — flower oz, concentrate g, infused mg THC — visible while the cart is being built. Yellow at 70%, red at 90%. Your budtender knows before the customer does."
          />
          <FeatureCard
            kicker="service mode"
            title="Express for regulars. Guided for new folks."
            body="One toggle, four modes: Express (keep the line moving), Guided (lead with effect, not THC%), First-time (start-low/go-slow + ID nudge), Medical-sensitive (no clinical claims; consult a clinician). The till matches the customer, not the other way around."
          />
          <FeatureCard
            kicker="real product knowledge"
            title="Know the strain. Even on day one."
            body="Strain, terpene profile, lab COA, customer reviews — one tap from the line item. Coming next: natural-language search (“something for sleep but not couch-lock”) backed by your actual inventory."
            tag="shipping next"
          />
          <FeatureCard
            kicker="refusal recovery"
            title="Never just say no."
            body="When a limit blocks the sale, the till suggests the package that fits — equivalent product, under the cap, in stock. Budtender looks like a hero. Customer doesn’t walk out empty-handed."
            tag="shipping next"
          />
        </div>

        <blockquote className="mx-auto mt-16 max-w-3xl border-l-4 border-mustard-400 bg-paper p-6 text-lg italic text-ink">
          “Make the right move the easy move. Make the wrong move impossible.”
          <footer className="mt-2 text-sm not-italic text-ink-soft">
            — our entire product philosophy, on one bumper sticker
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

function FeatureCard({
  kicker,
  title,
  body,
  tag,
}: {
  kicker: string;
  title: string;
  body: string;
  tag?: string;
}) {
  return (
    <div className="rounded-md border-2 border-kraft-300 bg-paper p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-widest text-clay-500">
          {kicker}
        </p>
        {tag && (
          <span className="rounded-sm bg-mustard-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">
            {tag}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mt-3 text-sm text-ink-soft">{body}</p>
    </div>
  );
}
