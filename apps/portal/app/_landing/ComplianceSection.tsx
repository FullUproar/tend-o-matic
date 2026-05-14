export function ComplianceSection() {
  return (
    <section id="compliance" className="bg-kraft-900 text-cream">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="font-script text-xl text-mustard-400">
            for the owner / GM / compliance officer
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold text-cream">
            Compliance is not a feature. It&rsquo;s the floor.
          </h2>
          <p className="mt-5 text-lg text-cream/80">
            Most cannabis POS vendors bolted state rules on after they shipped
            v1. We did it the other way around: the rules engine is the
            product. Every receipt, every tax line, every refusal — derived
            from a versioned, citable, auditable ruleset.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PillarCard
            title="Pure-function rules engine"
            body="No I/O, no surprises. The same kernel runs in the till, in the receipt printer, in your unit tests, and in an audit reproducer six months from now."
          />
          <PillarCard
            title="Versioned, dated rulesets"
            body="Every sale records the ruleset version it was decided under. When the law changes — or a regulator asks — we can replay any historic transaction byte-for-byte."
          />
          <PillarCard
            title="Regulator source watch"
            body="A nightly job pulls every state source we cite. When the text changes, the diff lands in your inbox before the regulator emails you about it."
          />
          <PillarCard
            title="Tenant-isolated by default"
            body="Postgres row-level security on every tenant-scoped table. A bug can&rsquo;t leak one tenant&rsquo;s sales to another — the database itself refuses."
          />
        </div>

        <div className="mt-16 rounded-md border-2 border-mustard-400 bg-kraft-700 p-6">
          <div className="text-xs uppercase tracking-widest text-mustard-400">
            What this means on the ground
          </div>
          <ul className="mt-3 space-y-2 text-cream/90">
            <li className="flex gap-3">
              <span className="text-mustard-400">→</span>
              <span>
                Refusal at the till? It comes with a citation. Not a vibe — a
                statute and a section number.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-mustard-400">→</span>
              <span>
                Tax math is line-itemized end-to-end. Excise, state retail,
                local cannabis tax, sales tax — every base, every rate, every
                cent traceable.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-mustard-400">→</span>
              <span>
                Metrc reporting is queued through an outbox with idempotency
                keys. Network glitch doesn&rsquo;t silently lose a manifest.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-mustard-400">→</span>
              <span>
                Every manager override, every void, every adjustment lands in
                the audit log with actor, reason, timestamp.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function PillarCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-mustard-400/40 bg-kraft-700/60 p-5">
      <h3 className="font-display text-lg font-bold text-mustard-400">
        {title}
      </h3>
      <p className="mt-2 text-sm text-cream/80">{body}</p>
    </div>
  );
}
