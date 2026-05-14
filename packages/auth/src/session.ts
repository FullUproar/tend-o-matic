import type { Role } from "./role";

export type Session = {
  // Stable session identifier; rotated on privilege changes.
  sid: string;
  userId: string;
  // Null for SUPER_ADMIN (portal); always set for tenant-scoped roles.
  tenantId: string | null;
  role: Role;
  // Device this session is bound to. Required for till and manager-
  // phone sessions; null for backoffice / portal browsers.
  deviceId: string | null;
  issuedAt: string;
  expiresAt: string;
  // Last permission revalidation timestamp. The till revalidates
  // permissions on each sale; backoffice revalidates per page.
  lastRevalidatedAt: string;
};
