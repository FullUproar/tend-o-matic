import type { ProductCategory } from "./product";
import type { LimitDimension } from "./limit";

// EquivalencyTable maps a product category to how its weight rolls into
// the limit dimensions tracked by the kernel. This is the single most
// dossier-gated piece of the kernel: the actual ratios live in jurisdiction
// rulesets and must be counsel-verified before production use.
//
// A category mapped to `undefined` means "the kernel does not know how
// this category counts toward limits", which causes a hard refusal at
// applyLineItem time. The cart never silently passes an unknown category.
export type CategoryEquivalency = {
  // Each gram of this category contributes this many grams toward the
  // total-ounces limit. Flower is 1:1 with itself.
  gramsPerGramAgainstTotalOunces: number;
  // If this category is also tracked under a category-specific dimension
  // (e.g. CONCENTRATE has a 15g cap separate from the 2.5 oz total),
  // declare that dimension here. Null means category-specific tracking
  // does not apply.
  categoryDimension: LimitDimension | null;
};

export type EquivalencyTable = Partial<Record<ProductCategory, CategoryEquivalency>>;
