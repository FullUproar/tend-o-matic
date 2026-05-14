// Manager-PIN override request. The brief calls this out as the
// highest-leverage UX feature in v1: the budtender does NOT walk over
// to grab a manager; the request fires to the manager's phone and is
// approved or denied remotely.
export type OverrideReasonCode =
  | "VOID_SALE"
  | "DISCOUNT_OVER_THRESHOLD"
  | "REOPEN_CLOSED_SALE"
  | "ACCEPT_OUTSIDE_LIMIT"
  | "OVERRIDE_PRODUCT_BLOCK"
  | "OTHER";

export type OverrideRequest = {
  id: string;
  tenantId: string;
  saleId: string | null;
  requestedByUserId: string;
  reason: OverrideReasonCode;
  freeText: string | null;
  requestedAt: string;
  expiresAt: string;
};

export type OverrideDecision =
  | { kind: "GRANTED"; managerUserId: string; phoneDeviceId: string; at: string }
  | { kind: "DENIED"; managerUserId: string; phoneDeviceId: string; at: string; note: string | null }
  | { kind: "EXPIRED"; at: string };

// The override flow itself is async: the till POSTs an OverrideRequest,
// the manager's phone subscribes and renders a single tap-to-grant /
// tap-to-deny screen, and the till polls or holds an open channel for
// the OverrideDecision. The audit row is written when the decision
// lands, in the same transaction as any state change the decision
// authorizes.
