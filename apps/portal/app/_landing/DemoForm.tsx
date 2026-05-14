"use client";

import { useState, useTransition } from "react";
import { submitDemoRequestAction } from "../actions";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

export function DemoForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setStatus({ kind: "submitting" });
    startTransition(async () => {
      const result = await submitDemoRequestAction({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        company: String(formData.get("company") ?? ""),
        role: String(formData.get("role") ?? ""),
        state: String(formData.get("state") ?? ""),
        message: String(formData.get("message") ?? ""),
      });
      if (result.ok) {
        setStatus({ kind: "ok" });
      } else {
        setStatus({ kind: "error", message: result.error });
      }
    });
  };

  if (status.kind === "ok") {
    return (
      <div className="rounded-md border-2 border-leaf-700 bg-paper p-6 text-center">
        <div className="font-display text-xl font-bold text-leaf-700">
          Got it. We&rsquo;ll reach out within one business day.
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          In the meantime, if you want to see the till in action sooner —
          email <span className="font-mono">demo@tend-o-matic.com</span> and
          we&rsquo;ll send a Loom.
        </p>
      </div>
    );
  }

  const busy = status.kind === "submitting" || isPending;

  return (
    <form
      action={onSubmit}
      className="rounded-md border-2 border-kraft-700 bg-paper p-6"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Your name" name="name" required />
        <Field label="Work email" name="email" type="email" required />
        <Field label="Dispensary / company" name="company" required />
        <Field label="Your role" name="role" placeholder="GM, owner, budtender…" />
        <Field label="State" name="state" placeholder="MI / IL / …" />
      </div>
      <label className="mt-4 block">
        <span className="block text-sm font-semibold text-ink">
          What&rsquo;s breaking for you today? (optional)
        </span>
        <textarea
          name="message"
          rows={3}
          className="mt-1 w-full rounded-sm border border-kraft-300 bg-cream px-3 py-2 text-sm"
          placeholder="The honest version. We can take it."
        />
      </label>

      {status.kind === "error" && (
        <div
          role="alert"
          className="mt-4 rounded-sm border-l-4 border-danger bg-clay-300/30 p-3 text-sm text-ink"
        >
          {status.message}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-ink-soft">
          No newsletter. No drip. We email you back. That&rsquo;s it.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="rounded-sm bg-leaf-700 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-cream hover:bg-leaf-600 disabled:bg-kraft-300"
        >
          {busy ? "Sending…" : "Request demo"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink">
        {label} {required && <span className="text-clay-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-kraft-300 bg-cream px-3 py-2 text-sm"
      />
    </label>
  );
}
