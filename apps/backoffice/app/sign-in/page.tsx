import { redirect } from "next/navigation";
import { auth, signIn } from "../../lib/auth";

export const dynamic = "force-dynamic";

type SearchParams = { error?: string; callbackUrl?: string };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (session?.user) redirect(searchParams.callbackUrl ?? "/");

  async function doSignIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    await signIn("credentials", { email, password, redirectTo: "/" });
  }

  const errorMessage =
    searchParams.error === "CredentialsSignin"
      ? "Email or password not recognized."
      : searchParams.error
        ? `Sign-in failed (${searchParams.error}).`
        : null;

  return (
    <main className="min-h-screen bg-parchment text-ink">
      <div className="mx-auto flex max-w-md flex-col gap-6 p-8 pt-16">
        <header>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold tracking-wide text-mustard-500">
              TEND-O-MATIC
            </span>
            <span className="font-script text-xl text-clay-500">backoffice</span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Sign in to manage products, sales, and operations.
          </p>
        </header>

        <form
          action={doSignIn}
          className="space-y-4 rounded-md border border-kraft-300 bg-cream p-6"
        >
          <label className="block">
            <span className="block text-sm text-ink-soft">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-3 py-3 font-mono"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-ink-soft">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-3 py-3 font-mono"
            />
          </label>
          {errorMessage && (
            <div
              role="alert"
              className="rounded-sm border-l-4 border-danger bg-clay-300 bg-opacity-30 p-2 text-sm text-ink"
            >
              {errorMessage}
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-sm bg-leaf-700 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-cream hover:bg-leaf-600"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
