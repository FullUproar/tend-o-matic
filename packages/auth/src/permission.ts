import type { Role } from "./role";

// Permissions are short, action-shaped codes. The kernel does not
// authorize — it refuses or accepts based on its own ruleset; auth
// authorizes user actions against the application surface (open a
// drawer, void a sale, accept a manifest, view PHI, etc.).
export const PERMISSIONS = [
  "till.open",
  "till.sale.start",
  "till.sale.void",
  "till.drawer.open",
  "till.scan.id",
  "backoffice.view",
  "backoffice.product.write",
  "backoffice.manifest.receive",
  "backoffice.metrc.outbox.replay",
  "manager.override.grant",
  "manager.override.deny",
  "manager.user.write",
  "manager.reports.view",
  "phi.customer.view",
  "phi.customer.export",
  "portal.tenant.read",
  "portal.tenant.write",
  "portal.fleet.view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSIONS_BY_ROLE: Readonly<Record<Role, ReadonlyArray<Permission>>> = {
  BUDTENDER: [
    "till.open",
    "till.sale.start",
    "till.drawer.open",
    "till.scan.id",
  ],
  MANAGER: [
    "till.open",
    "till.sale.start",
    "till.sale.void",
    "till.drawer.open",
    "till.scan.id",
    "backoffice.view",
    "backoffice.product.write",
    "backoffice.manifest.receive",
    "backoffice.metrc.outbox.replay",
    "manager.override.grant",
    "manager.override.deny",
    "manager.reports.view",
    "phi.customer.view",
  ],
  ADMIN: [
    "till.open",
    "till.sale.start",
    "till.sale.void",
    "till.drawer.open",
    "till.scan.id",
    "backoffice.view",
    "backoffice.product.write",
    "backoffice.manifest.receive",
    "backoffice.metrc.outbox.replay",
    "manager.override.grant",
    "manager.override.deny",
    "manager.user.write",
    "manager.reports.view",
    "phi.customer.view",
    "phi.customer.export",
  ],
  SUPER_ADMIN: [
    "portal.tenant.read",
    "portal.tenant.write",
    "portal.fleet.view",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS_BY_ROLE[role].includes(permission);
}
