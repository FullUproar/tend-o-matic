import type { CustomerType } from "./customer";
import type { ProductCategory } from "./product";
import type { Weight } from "./weight";
import type { Ruleset } from "./ruleset";

export type LineItem = {
  packageId: string;
  category: ProductCategory;
  weight: Weight;
  unitPriceCents: number;
  qty: number;
  // Product-eligibility flags captured at scan time. The cart refuses
  // line items that don't carry the affirmative flags; absence is a
  // refusal, never a permissive default.
  tested: boolean;
  labeled: boolean;
  recalled: boolean;
};

export type Cart = {
  tenantId: string;
  locationId: string;
  customer: CustomerType;
  ruleset: Ruleset;
  lines: ReadonlyArray<LineItem>;
  // ISO timestamp the cart was opened. Used for day/month limit windows
  // and to pin which ruleset version applies.
  openedAt: string;
  // Whether the customer's ID was verified on this transaction. The
  // kernel refuses to apply a line item when this is false for an adult-
  // use sale; medical patient verification is tracked separately on
  // the customer-type variant.
  idVerified: boolean;
};
