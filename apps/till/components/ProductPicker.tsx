"use client";

import { useMemo, useState } from "react";
import type { LineItem } from "@tend-o-matic/compliance";
import type { CatalogProduct } from "../lib/catalog";
import { useBarcodeScanner } from "../lib/useBarcodeScanner";

type Props = {
  catalog: ReadonlyArray<CatalogProduct>;
  onAddLine: (line: LineItem) => void;
};

function formatCents(c: number): string {
  return `$${(c / 100).toFixed(2)}`;
}

export function ProductPicker({ catalog, onAddLine }: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [weightValue, setWeightValue] = useState("3.5");
  const [qty, setQty] = useState("1");
  const [priceCents, setPriceCents] = useState("5000");
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const selected = useMemo(
    () => catalog.find((p) => p.id === selectedId) ?? null,
    [catalog, selectedId],
  );

  const filtered = useMemo(() => {
    if (!search) return catalog;
    const s = search.toLowerCase();
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.strain ?? "").toLowerCase().includes(s) ||
        (p.brand ?? "").toLowerCase().includes(s),
    );
  }, [catalog, search]);

  useBarcodeScanner({
    onScan: (code) => {
      const found = catalog.find((p) => p.sku === code);
      if (found) {
        setSelectedId(found.id);
        setSearch("");
        setScanFeedback(`Scanned: ${found.name}`);
      } else {
        setScanFeedback(`No product matches barcode: ${code}`);
      }
    },
  });

  const handlePick = (id: string) => {
    setSelectedId(id);
    setScanFeedback(null);
    const p = catalog.find((x) => x.id === id);
    if (p?.category === "INFUSED" || p?.category === "EDIBLE") {
      setWeightValue(String(p.thcMg ?? 100));
    } else {
      setWeightValue("3.5");
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const w = parseFloat(weightValue);
    const q = parseInt(qty, 10);
    const price = parseInt(priceCents, 10);
    if (!Number.isFinite(w) || !Number.isFinite(q) || !Number.isFinite(price)) return;
    const line: LineItem = {
      packageId: selected.id, // till uses Product.id; server action resolves to a Package
      category: selected.category,
      weight: { value: w, unit: selected.defaultWeightUnit },
      qty: q,
      unitPriceCents: price,
      tested: true,
      labeled: true,
      recalled: false,
      ...(selected.adjustedThcPct !== null
        ? { adjustedThcPct: selected.adjustedThcPct }
        : {}),
    };
    onAddLine(line);
    setSelectedId(null);
    setSearch("");
  };

  if (catalog.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-kraft-300 bg-paper p-4 text-center text-sm text-ink-soft">
        No products in catalog. A manager must create products in the backoffice
        before sales can start.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scanFeedback && (
        <div className="rounded-sm border-l-4 border-leaf-700 bg-cream px-3 py-2 text-xs">
          {scanFeedback}
        </div>
      )}

      {!selected ? (
        <div className="rounded-md border border-kraft-300 bg-cream p-4">
          <label className="block">
            <span className="block text-xs text-ink-soft">
              Search or scan barcode
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Product name, SKU, strain…"
              className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-3 py-3 font-mono"
            />
          </label>
          <ul className="mt-3 max-h-80 divide-y divide-kraft-300 overflow-y-auto">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handlePick(p.id)}
                  className="flex w-full items-baseline justify-between gap-3 px-2 py-2 text-left hover:bg-paper"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-ink-soft">
                      {p.category}
                      {p.strain ? ` · ${p.strain}` : ""}
                      {p.brand ? ` · ${p.brand}` : ""}
                      {p.adjustedThcPct !== null
                        ? ` · ${p.adjustedThcPct.toFixed(1)}% THC`
                        : ""}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-ink-soft">{p.sku}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2 py-4 text-center text-xs text-ink-soft">
                No match. Adjust search or scan again.
              </li>
            )}
          </ul>
        </div>
      ) : (
        <form
          onSubmit={handleAdd}
          className="rounded-md border-2 border-leaf-700 bg-cream p-4"
        >
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-display text-base font-semibold">
                {selected.name}
              </div>
              <div className="text-xs text-ink-soft">
                {selected.category} · {selected.sku}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-xs text-ink-soft hover:text-ink"
            >
              ← Change product
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <label>
              <span className="block text-xs text-ink-soft">
                Weight ({selected.defaultWeightUnit})
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono"
              />
            </label>
            <label>
              <span className="block text-xs text-ink-soft">Qty</span>
              <input
                type="number"
                min="1"
                step="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono"
              />
            </label>
            <label>
              <span className="block text-xs text-ink-soft">Price (cents)</span>
              <input
                type="number"
                min="0"
                step="1"
                value={priceCents}
                onChange={(e) => setPriceCents(e.target.value)}
                className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono"
              />
            </label>
          </div>
          <div className="mt-2 text-xs text-ink-soft">
            Line total:{" "}
            <span className="font-mono">
              {formatCents(parseInt(priceCents || "0", 10) * parseInt(qty || "0", 10))}
            </span>
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-sm bg-leaf-700 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-cream hover:bg-leaf-600"
          >
            Add to cart
          </button>
        </form>
      )}
    </div>
  );
}
