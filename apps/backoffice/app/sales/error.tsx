"use client";

// Route-segment error boundary for /sales and /sales/[id]. Next.js
// app router catches uncaught server/client errors thrown during
// rendering and presents this fallback. Without it the user sees the
// default Next.js stack-trace overlay in dev and a generic Vercel
// error in production — neither is appropriate for a manager looking
// at sales reports during business hours.

import Link from "next/link";

export default function SalesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <div className="mx-auto max-w-2xl p-8">
        <div className="rounded-md border-l-4 border-danger bg-cream p-4">
          <h1 className="font-display text-xl font-semibold text-danger">
            Sales page failed to render
          </h1>
          <p className="mt-2 text-sm">
            The server hit an error while loading this view. The underlying
            sale records are unaffected — only the dashboard / list page
            failed to assemble.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-ink-soft">
              Error digest: {error.digest}
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-sm bg-leaf-700 px-4 py-2 text-sm font-semibold uppercase text-cream hover:bg-leaf-600"
            >
              Retry
            </button>
            <Link
              href="/"
              className="rounded-sm border border-kraft-300 px-4 py-2 text-sm hover:border-kraft-700"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
