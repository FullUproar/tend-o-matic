# @tend-o-matic/auth

Sessions, RBAC, device-bound till registration, manager-PIN overrides.

## Roles + permissions

Four roles: `BUDTENDER`, `MANAGER`, `ADMIN`, `SUPER_ADMIN`. `SUPER_ADMIN` lives outside tenant scope and is the only role permitted to use the BYPASSRLS database role. `PERMISSIONS_BY_ROLE` declares the permission map; everything tenant-scoped goes through `hasPermission(role, permission)`.

## Device binding

Each till and each manager phone holds a long-lived device credential (private key on device, public key in `device` table). Sessions on that till are bound to `device_id`; rotating or revoking the device kills sessions. Pure types in v0.1 — the crypto exchange (`DeviceChallenge` / `DeviceSignature`) is a future PR.

## Manager overrides (async / remote)

The brief's highest-leverage UX item. The till POSTs an `OverrideRequest`, the manager's phone receives a push, the manager taps grant or deny, and the till resumes. No walking over. Types only in v0.1.
