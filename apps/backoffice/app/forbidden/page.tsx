import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment text-ink">
      <div className="max-w-md rounded-md border border-kraft-300 bg-cream p-8 text-center">
        <h1 className="font-display text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Your account doesn&apos;t have permission to use the backoffice.
          Budtenders should sign in at the till instead.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block rounded-sm bg-leaf-700 px-4 py-2 text-sm font-semibold text-cream hover:bg-leaf-600"
        >
          Sign in as a different user
        </Link>
      </div>
    </main>
  );
}
