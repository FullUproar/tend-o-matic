// Shared product form used by both /products/new and /products/[id].
// The action prop is the server action (bound with productId for edits).
"use client";

import { useFormStatus } from "react-dom";

const CATEGORIES = [
  "FLOWER",
  "PRE_ROLL",
  "CONCENTRATE",
  "EDIBLE",
  "INFUSED",
  "TOPICAL",
  "IMMATURE_PLANT",
  "OTHER",
];

export type ProductFormValues = {
  sku?: string;
  name?: string;
  category?: string;
  strain?: string | null;
  brand?: string | null;
  description?: string | null;
  thcD9Pct?: number | null;
  thcaPct?: number | null;
  adjustedThcPct?: number | null;
  thcMg?: number | null;
  cbdMg?: number | null;
  labCoaUrl?: string | null;
};

type Props = {
  action: (form: FormData) => void | Promise<void>;
  initial?: ProductFormValues;
  submitLabel: string;
};

function num(v: number | null | undefined): string {
  return v === null || v === undefined ? "" : String(v);
}

function str(v: string | null | undefined): string {
  return v ?? "";
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-leaf-700 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-cream hover:bg-leaf-600 disabled:bg-kraft-300"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProductForm({ action, initial, submitLabel }: Props) {
  return (
    <form
      action={action}
      className="grid grid-cols-1 gap-4 rounded-md border border-kraft-300 bg-cream p-6 md:grid-cols-2"
    >
      <Field label="SKU *" name="sku" defaultValue={str(initial?.sku)} required />
      <Field label="Name *" name="name" defaultValue={str(initial?.name)} required />

      <label className="block">
        <span className="block text-sm text-ink-soft">Category *</span>
        <select
          name="category"
          required
          defaultValue={str(initial?.category) || "FLOWER"}
          className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-3 py-3"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <Field label="Brand" name="brand" defaultValue={str(initial?.brand)} />
      <Field label="Strain" name="strain" defaultValue={str(initial?.strain)} />
      <Field
        label="Lab COA URL"
        name="labCoaUrl"
        type="url"
        defaultValue={str(initial?.labCoaUrl)}
      />

      <Field
        label="Δ9-THC %"
        name="thcD9Pct"
        type="number"
        step="0.001"
        defaultValue={num(initial?.thcD9Pct)}
        hint="Per IL CRTA adjusted-THC formula"
      />
      <Field
        label="THCA %"
        name="thcaPct"
        type="number"
        step="0.001"
        defaultValue={num(initial?.thcaPct)}
        hint="adjusted = Δ9-THC% + 0.877 × THCA%"
      />
      <Field
        label="THC mg (per unit)"
        name="thcMg"
        type="number"
        step="0.001"
        defaultValue={num(initial?.thcMg)}
      />
      <Field
        label="CBD mg (per unit)"
        name="cbdMg"
        type="number"
        step="0.001"
        defaultValue={num(initial?.cbdMg)}
      />

      {initial?.adjustedThcPct !== undefined && initial.adjustedThcPct !== null && (
        <div className="rounded-sm bg-paper px-3 py-2 text-xs md:col-span-2">
          Current adjusted THC %:{" "}
          <span className="font-mono">{initial.adjustedThcPct.toFixed(3)}</span>{" "}
          (will be recomputed from Δ9 / THCA on save)
        </div>
      )}

      <label className="md:col-span-2 block">
        <span className="block text-sm text-ink-soft">Description</span>
        <textarea
          name="description"
          defaultValue={str(initial?.description)}
          rows={3}
          className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-3 py-2 font-mono text-sm"
        />
      </label>

      <div className="md:col-span-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  step,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  step?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-ink-soft">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        step={step}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-3 py-3 font-mono"
      />
      {hint && <span className="mt-1 block text-[10px] text-ink-soft">{hint}</span>}
    </label>
  );
}
