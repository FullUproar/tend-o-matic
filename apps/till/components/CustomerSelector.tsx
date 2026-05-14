"use client";

import type { CustomerType } from "@tend-o-matic/compliance";

type Props = {
  customer: CustomerType;
  idVerified: boolean;
  onCustomerChange: (customer: CustomerType) => void;
  onIdVerifiedChange: (idVerified: boolean) => void;
};

// MI-only options for M2.5b (IL launches in a later milestone).
const CUSTOMER_OPTIONS: Array<{ kind: CustomerType["kind"]; label: string }> = [
  { kind: "MI_ADULT_USE", label: "Adult-use (21+)" },
  { kind: "MI_MED_PATIENT", label: "Medical patient" },
  { kind: "MI_MED_CAREGIVER", label: "Medical caregiver" },
];

export function CustomerSelector({
  customer,
  idVerified,
  onCustomerChange,
  onIdVerifiedChange,
}: Props) {
  const handleKindChange = (kind: CustomerType["kind"]) => {
    if (kind === "MI_ADULT_USE") {
      onCustomerChange({ kind });
    } else if (kind === "MI_MED_PATIENT") {
      onCustomerChange({ kind, registryIdHash: "demo-patient-hash" });
    } else if (kind === "MI_MED_CAREGIVER") {
      onCustomerChange({
        kind,
        caregiverIdHash: "demo-caregiver-hash",
        servingPatientIdHash: "demo-patient-hash",
      });
    }
  };

  return (
    <fieldset className="rounded-md border border-kraft-300 bg-cream p-4">
      <legend className="px-2 font-display text-sm font-semibold text-ink">
        Customer
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {CUSTOMER_OPTIONS.map((opt) => (
          <button
            key={opt.kind}
            type="button"
            onClick={() => handleKindChange(opt.kind)}
            className={`rounded-sm border-2 px-3 py-3 text-sm font-medium transition-colors ${
              customer.kind === opt.kind
                ? "border-leaf-700 bg-leaf-700 text-cream"
                : "border-kraft-300 bg-paper text-ink hover:border-kraft-500"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={idVerified}
          onChange={(e) => onIdVerifiedChange(e.target.checked)}
          className="h-5 w-5 cursor-pointer accent-leaf-700"
        />
        <span>ID verified (required for adult-use)</span>
      </label>
    </fieldset>
  );
}
