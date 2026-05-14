"use client";

import { useState } from "react";
import type { LineItem } from "@tend-o-matic/compliance";

type Props = {
  onAddLine: (line: LineItem) => void;
};

type CategoryOption = {
  value: LineItem["category"];
  label: string;
  defaultUnit: LineItem["weight"]["unit"];
};

const CATEGORIES: CategoryOption[] = [
  { value: "FLOWER", label: "Flower", defaultUnit: "G" },
  { value: "PRE_ROLL", label: "Pre-roll", defaultUnit: "G" },
  { value: "CONCENTRATE", label: "Concentrate", defaultUnit: "G" },
  { value: "EDIBLE", label: "Edible", defaultUnit: "G" },
  { value: "INFUSED", label: "Infused (MI: refuses — form unknown)", defaultUnit: "G" },
  { value: "IMMATURE_PLANT", label: "Immature plant", defaultUnit: "UNITS" },
];

const UNITS: Array<LineItem["weight"]["unit"]> = [
  "G",
  "OZ",
  "MG_THC",
  "UNITS",
];

export function LineEntry({ onAddLine }: Props) {
  const [category, setCategory] = useState<LineItem["category"]>("FLOWER");
  const [weightValue, setWeightValue] = useState("3.5");
  const [weightUnit, setWeightUnit] = useState<LineItem["weight"]["unit"]>("G");
  const [qty, setQty] = useState("1");
  const [priceCents, setPriceCents] = useState("5000");
  const [packageId, setPackageId] = useState(
    () => `demo-${Math.random().toString(36).slice(2, 8)}`,
  );
  const [thcPct, setThcPct] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(weightValue);
    const qtyNum = parseInt(qty, 10);
    const priceNum = parseInt(priceCents, 10);
    if (
      !Number.isFinite(weight) ||
      !Number.isFinite(qtyNum) ||
      !Number.isFinite(priceNum)
    ) {
      return;
    }
    const line: LineItem = {
      packageId,
      category,
      weight: { value: weight, unit: weightUnit },
      qty: qtyNum,
      unitPriceCents: priceNum,
      tested: true,
      labeled: true,
      recalled: false,
      ...(thcPct.trim()
        ? { adjustedThcPct: parseFloat(thcPct) }
        : {}),
    };
    onAddLine(line);
    // Reset packageId so the next add doesn't collide.
    setPackageId(`demo-${Math.random().toString(36).slice(2, 8)}`);
  };

  const handleCategoryChange = (value: LineItem["category"]) => {
    setCategory(value);
    const opt = CATEGORIES.find((c) => c.value === value);
    if (opt) setWeightUnit(opt.defaultUnit);
  };

  return (
    <form
      onSubmit={handleAdd}
      className="rounded-md border border-kraft-300 bg-cream p-4"
    >
      <h2 className="font-display text-sm font-semibold text-ink">Add line</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <label className="col-span-2">
          <span className="block text-ink-soft">Category</span>
          <select
            value={category}
            onChange={(e) =>
              handleCategoryChange(e.target.value as LineItem["category"])
            }
            className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-ink-soft">Weight</span>
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
          <span className="block text-ink-soft">Unit</span>
          <select
            value={weightUnit}
            onChange={(e) =>
              setWeightUnit(e.target.value as LineItem["weight"]["unit"])
            }
            className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-ink-soft">Qty</span>
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
          <span className="block text-ink-soft">Price (cents)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono"
          />
        </label>
        <label className="col-span-2">
          <span className="block text-ink-soft">
            Adjusted THC % (IL non-infused; leave blank for MI)
          </span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={thcPct}
            onChange={(e) => setThcPct(e.target.value)}
            className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono"
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-4 w-full rounded-sm bg-leaf-700 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-cream hover:bg-leaf-600"
      >
        Add to cart
      </button>
    </form>
  );
}
