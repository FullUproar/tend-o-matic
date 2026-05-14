// Server-side authorization helpers. Use these in any server action or
// route handler that mutates state — the role-gate from loadIdentity()
// is too coarse for fine-grained operations like
// "BUDTENDER can sell but not void a sale" or
// "MANAGER can write products but not export PHI".
//
// Usage:
//   const session = await auth();
//   await requirePermission(session, "backoffice.product.write");
//
// Throws PermissionDeniedError on refusal; the route handler should
// catch + return a 403 (or rely on Next.js's error boundary in app router).

import type { Session } from "next-auth";
import { hasPermission, type Permission } from "@tend-o-matic/auth";
import type { UserRole } from "./config";

export class PermissionDeniedError extends Error {
  constructor(
    public required: Permission,
    public actualRole?: UserRole,
  ) {
    super(
      `Permission denied: required '${required}'${
        actualRole ? `, role is '${actualRole}'` : " (not signed in)"
      }`,
    );
    this.name = "PermissionDeniedError";
  }
}

// Mapping between the packages/auth-runtime UserRole (mirrors Prisma's
// UserRole enum) and packages/auth Role (which adds SUPER_ADMIN for
// portal). For MVP these are 1:1; SUPER_ADMIN sessions don't reach the
// till or backoffice anyway.
function toAuthRole(r: UserRole): UserRole {
  return r;
}

export function requirePermission(
  session: Session | null,
  permission: Permission,
): asserts session is Session {
  if (!session?.user) {
    throw new PermissionDeniedError(permission);
  }
  const role = toAuthRole(session.user.role);
  if (!hasPermission(role, permission)) {
    throw new PermissionDeniedError(permission, role);
  }
}

export function canPermission(
  session: Session | null,
  permission: Permission,
): boolean {
  if (!session?.user) return false;
  return hasPermission(toAuthRole(session.user.role), permission);
}
