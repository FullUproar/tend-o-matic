import Link from "next/link";
import { Hero } from "./_landing/Hero";
import { BudtenderSection } from "./_landing/BudtenderSection";
import { ComplianceSection } from "./_landing/ComplianceSection";
import { ScreenshotStrip } from "./_landing/ScreenshotStrip";
import { HonestStatus } from "./_landing/HonestStatus";
import { DemoForm } from "./_landing/DemoForm";
import { SiteHeader } from "./_landing/SiteHeader";
import { SiteFooter } from "./_landing/SiteFooter";

export default function Page() {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <SiteHeader />
      <Hero />
      <BudtenderSection />
      <ComplianceSection />
      <ScreenshotStrip />
      <HonestStatus />
      <section id="demo" className="border-t-2 border-kraft-300 bg-cream">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-ink">
              See it run on your floor
            </h2>
            <p className="mt-3 text-ink-soft">
              Twenty minutes. Real till. Real headroom math. We&rsquo;ll bring
              the receipt printer.
            </p>
          </div>
          <div className="mt-8">
            <DemoForm />
          </div>
          <p className="mt-6 text-center text-xs text-ink-soft">
            Already onboarded?{" "}
            <Link
              href="https://till.tend-o-matic.com"
              className="underline hover:text-ink"
            >
              Sign in to the till →
            </Link>
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
