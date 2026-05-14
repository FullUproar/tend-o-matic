import type { Cart, LineItem } from "./cart";
import type { CustomerType } from "./customer";
import type { TaxRate } from "./tax";
import type { Ruleset } from "./ruleset";
import type { RefusalReason } from "./refusal";
import type { ComplianceKernel } from "./kernel";

// CartAction is the closed set of user-driven state changes the cart
// supports. Per Afterroar's "no cart state machine" pattern, there is
// no OPEN/COMPLETED/VOIDED state on the cart itself — the cart is
// ephemeral client state, and "completion" produces a Sale ledger
// entry (M2.2). Voiding an open cart is just discarding it.
export type CartAction =
  | { type: "ADD_LINE"; line: LineItem }
  | { type: "REMOVE_LINE"; packageId: string }
  | { type: "SET_CUSTOMER"; customer: CustomerType }
  | { type: "SET_ID_VERIFIED"; idVerified: boolean }
  | { type: "SET_LOCAL_TAXES"; localTaxes: ReadonlyArray<TaxRate> };

export type ReducerResult =
  | { ok: true; cart: Cart }
  | { ok: false; reason: RefusalReason };

// openCart constructs a fresh cart. Lines start empty; idVerified
// defaults to false (the budtender must explicitly mark it true before
// adult-use line items can be added).
export function openCart(args: {
  tenantId: string;
  locationId: string;
  customer: CustomerType;
  ruleset: Ruleset;
  openedAt?: string;
  idVerified?: boolean;
  localTaxes?: ReadonlyArray<TaxRate>;
}): Cart {
  return {
    tenantId: args.tenantId,
    locationId: args.locationId,
    customer: args.customer,
    ruleset: args.ruleset,
    lines: [],
    openedAt: args.openedAt ?? new Date().toISOString(),
    idVerified: args.idVerified ?? false,
    localTaxes: args.localTaxes,
  };
}

// reduce applies a single action against a cart. Pure: returns a new
// cart on success, a refusal reason on kernel-rejection.
//
// Only ADD_LINE is gated by the kernel — every other action is a
// metadata change that cannot make a previously-valid cart invalid in
// any way the kernel can detect at action time. SET_CUSTOMER is the
// exception: changing customer kind across jurisdictions while lines
// are present can leave the cart in an internally-inconsistent state.
// The reducer permits the action but flags it; the application layer
// is responsible for clearing lines before allowing a customer change.
export function reduce(
  cart: Cart,
  action: CartAction,
  kernel: ComplianceKernel,
): ReducerResult {
  switch (action.type) {
    case "ADD_LINE":
      return kernel.applyLineItem(cart, action.line);

    case "REMOVE_LINE":
      return {
        ok: true,
        cart: {
          ...cart,
          lines: cart.lines.filter((l) => l.packageId !== action.packageId),
        },
      };

    case "SET_CUSTOMER":
      return { ok: true, cart: { ...cart, customer: action.customer } };

    case "SET_ID_VERIFIED":
      return { ok: true, cart: { ...cart, idVerified: action.idVerified } };

    case "SET_LOCAL_TAXES":
      return {
        ok: true,
        cart: { ...cart, localTaxes: action.localTaxes },
      };
  }
}

// applyAll folds a sequence of actions through the reducer, stopping
// at the first refusal. Convenience for tests + replay scenarios.
export function applyAll(
  cart: Cart,
  actions: ReadonlyArray<CartAction>,
  kernel: ComplianceKernel,
):
  | { ok: true; cart: Cart }
  | { ok: false; reason: RefusalReason; failedActionIndex: number } {
  let current = cart;
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]!;
    const r = reduce(current, action, kernel);
    if (!r.ok) return { ok: false, reason: r.reason, failedActionIndex: i };
    current = r.cart;
  }
  return { ok: true, cart: current };
}
