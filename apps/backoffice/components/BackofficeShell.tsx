import Link from "next/link";
import type { BackofficeIdentity } from "../lib/identity";
import { signOutAction } from "../app/actions";

type Props = {
  identity: BackofficeIdentity;
  activeSection: "dashboard" | "products" | "sales" | "settings";
  children: React.ReactNode;
};

const NAV: Array<{ href: string; label: string; section: Props["activeSection"] }> = [
  { href: "/", label: "Dashboard", section: "dashboard" },
  { href: "/products", label: "Products", section: "products" },
  { href: "/sales", label: "Sales", section: "sales" },
  { href: "/settings", label: "Settings", section: "settings" },
];

export function BackofficeShell({ identity, activeSection, children }: Props) {
  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr] bg-parchment text-ink">
      <aside className="border-r-2 border-kraft-700 bg-cream px-4 py-6">
        <div className="border-b border-kraft-300 pb-4">
          <div className="font-display text-xl font-semibold tracking-wide text-mustard-500">
            TEND-O-MATIC
          </div>
          <div className="font-script text-sm text-clay-500">backoffice</div>
        </div>

        <nav className="mt-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.section}
              href={item.href}
              className={`block rounded-sm px-3 py-2 text-sm transition-colors ${
                activeSection === item.section
                  ? "bg-leaf-700 text-cream"
                  : "text-ink hover:bg-paper hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <div className="text-xs text-ink-soft">{identity.tenantName}</div>
          <div className="mt-1 text-xs">
            <span className="font-medium">{identity.userName}</span>{" "}
            <span className="text-ink-soft">· {identity.role.toLowerCase()}</span>
          </div>
          <form action={signOutAction} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-sm border border-kraft-300 px-3 py-1 text-xs text-ink-soft hover:border-kraft-500 hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="overflow-x-auto p-8">{children}</main>
    </div>
  );
}
