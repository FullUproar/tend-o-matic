// Tenant-context helper. The application MUST wrap every database
// interaction in withTenant() so that RLS policies see the GUC.
//
// This module declares structural types for the Prisma client to avoid
// a hard dependency on @prisma/client at typecheck time. Consumers
// import this from @tend-o-matic/db and pass their own PrismaClient
// instance generated from packages/db/prisma/schema.prisma.

export interface TransactionClient {
  $executeRaw(
    template: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<number>;
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
}

export interface PrismaLike {
  $transaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T>;
}

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantContextError";
  }
}

// withTenant runs `fn` inside a single transaction whose session-local
// `app.tenant_id` setting equals `tenantId`. RLS policies see the GUC
// and scope every query.
//
// Important: do NOT use the outer prisma client inside `fn` — always
// use the `tx` argument. Queries against the outer client bypass the
// transaction and therefore bypass the tenant GUC.
export async function withTenant<T>(
  prisma: PrismaLike,
  tenantId: string,
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  if (!isUuidLike(tenantId)) {
    throw new TenantContextError(
      `withTenant: tenantId must be a UUID string, got: ${JSON.stringify(tenantId)}`,
    );
  }
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_tenant_context(${tenantId}::uuid)`;
    return fn(tx);
  });
}

function isUuidLike(s: unknown): s is string {
  if (typeof s !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
