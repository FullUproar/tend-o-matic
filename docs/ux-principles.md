# UX principles (front of house)

These are the rules of engagement for `apps/till` and any customer-facing
flow. They are descriptive of how the till must feel under load on a busy
Friday night, not aspirational design copy.

- **Touch, don't type.** Number pad + search-as-you-type only. No
  text-entry where a list, pad, or scan will do.
- **Scan, don't search.** Everything barcodable. The fast path is always
  the scanner.
- **Thumb-zone primary actions** on a tablet held two-handed. The
  highest-frequency tap is the easiest reach.
- **One screen per transaction.** No mid-flow navigation. The cashier
  never has to leave the cart to do something the cart needs.
- **Loud failures, quiet successes.** Green is silent. Red is unmissable.
- **Undo, don't confirm.** "Are you sure?" modals are friction theater.
  Make the destructive action reversible instead.
- **Compliance as thermometer, not gate.** Limit usage shows as a fuel
  gauge next to the subtotal — the cashier sees it filling, doesn't
  discover it at checkout.
- **Manager overrides are remote-async**, via manager's phone. No
  walk-over. This is the highest-leverage UX feature in v1.

## Back-office wedges (mirror principle: decisions, not reports)

- METRC reconciliation = **inbox of decisions**, not a 200-row report.
- Manifest receiving = **guided flow** from scanned manifest QR.
- Reporting = **in-app pivot/filter with shareable URLs**, not CSV export.
- Mobile-first manager dashboard.
- Settings **preview the next receipt** with the change applied, before save.
- Compliance dossier surfaced in-app with version history.
