export const ROLES = ["BUDTENDER", "MANAGER", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

// SUPER_ADMIN is a portal-only role with no tenant attachment. It is the
// only role that traverses tenants and the only role allowed to connect
// via the BYPASSRLS DB credential.
export function isTenantRole(r: Role): boolean {
  return r !== "SUPER_ADMIN";
}
