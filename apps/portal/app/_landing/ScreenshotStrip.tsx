export function ScreenshotStrip() {
  return (
    <section className="border-t-2 border-kraft-300 bg-parchment">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="font-script text-xl text-clay-500">what works today</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-ink">
            Not vapor. Screenshots from the actual till.
          </h2>
          <p className="mt-3 text-ink-soft">
            Pulled from our Playwright E2E suite. Same code path you&rsquo;ll
            run on your floor.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Mockup title="The till" caption="Customer + product picker + headroom bar + per-line tax preview.">
            <TillMockup />
          </Mockup>
          <Mockup title="The receipt" caption="80mm ESC/POS — every cent attributable to a tax rule with a citation.">
            <ReceiptMockup />
          </Mockup>
          <Mockup title="The backoffice" caption="Sales report, voids with reason capture, source watch alerts.">
            <BackofficeMockup />
          </Mockup>
        </div>
      </div>
    </section>
  );
}

function Mockup({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border-2 border-kraft-700 bg-cream p-3">
      <div className="aspect-[4/3] overflow-hidden rounded-sm border border-kraft-300 bg-paper">
        {children}
      </div>
      <div className="px-1 pb-1 pt-3">
        <div className="font-display text-sm font-bold text-ink">{title}</div>
        <div className="mt-1 text-xs text-ink-soft">{caption}</div>
      </div>
    </div>
  );
}

function TillMockup() {
  return (
    <div className="flex h-full flex-col p-3 text-[10px]">
      <div className="rounded-sm bg-leaf-700 px-2 py-1 font-mono text-cream">
        MI_ADULT_USE · ID verified ✓
      </div>
      <div className="mt-2 flex-1 rounded-sm border border-kraft-300 bg-cream p-2">
        <div className="mb-1 font-semibold">CART</div>
        <div className="flex justify-between border-b border-kraft-300/50 py-0.5">
          <span>Blue Dream · 3.5g</span>
          <span className="font-mono">$45.00</span>
        </div>
        <div className="flex justify-between border-b border-kraft-300/50 py-0.5">
          <span>Live Rosin · 1g</span>
          <span className="font-mono">$60.00</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>Gummies 100mg</span>
          <span className="font-mono">$25.00</span>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <div>
          <div className="flex justify-between text-[9px]">
            <span>Flower-equiv</span>
            <span>1.8 / 2.5 oz</span>
          </div>
          <div className="h-1 w-full bg-kraft-100">
            <div className="h-full w-[72%] bg-mustard-500" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[9px]">
            <span>Concentrate</span>
            <span>1.0 / 8 g</span>
          </div>
          <div className="h-1 w-full bg-kraft-100">
            <div className="h-full w-[12%] bg-leaf-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptMockup() {
  return (
    <div className="h-full overflow-hidden bg-paper p-3 font-mono text-[9px] leading-tight text-ink">
      <div className="text-center font-bold">DEMO MI DISPENSARY</div>
      <div className="text-center">Ann Arbor · AU-R-000123</div>
      <div className="mt-1 text-center">2026-05-14 14:32</div>
      <div className="my-2 border-t border-dashed border-kraft-700" />
      <div className="flex justify-between">
        <span>Blue Dream 3.5g</span>
        <span>45.00</span>
      </div>
      <div className="pl-2 text-ink-soft">excise 10% .... 4.50</div>
      <div className="flex justify-between">
        <span>Live Rosin 1g</span>
        <span>60.00</span>
      </div>
      <div className="pl-2 text-ink-soft">excise 10% .... 6.00</div>
      <div className="my-2 border-t border-dashed border-kraft-700" />
      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>121.55</span>
      </div>
      <div className="mt-2 text-[8px] text-ink-soft">
        Ruleset MI 2026-05-14 · cite MCL 333.27958
      </div>
    </div>
  );
}

function BackofficeMockup() {
  return (
    <div className="h-full bg-cream p-3 text-[9px]">
      <div className="font-display text-xs font-bold">SALES — today</div>
      <table className="mt-2 w-full">
        <thead className="text-ink-soft">
          <tr className="border-b border-kraft-300">
            <th className="text-left">Time</th>
            <th className="text-left">Cashier</th>
            <th className="text-right">Total</th>
            <th className="text-right">Status</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          <tr className="border-b border-kraft-300/40">
            <td>14:32</td>
            <td>S. Cashier</td>
            <td className="text-right">$121.55</td>
            <td className="text-right text-leaf-700">COMPLETE</td>
          </tr>
          <tr className="border-b border-kraft-300/40">
            <td>14:18</td>
            <td>S. Cashier</td>
            <td className="text-right">$48.20</td>
            <td className="text-right text-leaf-700">COMPLETE</td>
          </tr>
          <tr className="border-b border-kraft-300/40">
            <td>13:55</td>
            <td>S. Cashier</td>
            <td className="text-right">$92.00</td>
            <td className="text-right text-clay-700">VOIDED</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-3 rounded-sm border-l-2 border-mustard-500 bg-paper px-2 py-1 text-ink">
        ALERT: MI MMRA section 27958 text changed — diff ready to review
      </div>
    </div>
  );
}
