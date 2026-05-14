// METRC operations we plan to support, in roughly the order Phase 2
// will implement them. Operations are stored as strings in the
// metrc_outbox.operation column (not an enum) so adding new ones is
// a schema-free deploy.
export const METRC_OPERATIONS = [
  "sales_receipt.create",
  "sales_receipt.update",
  "sales_receipt.void",
  "package.lookup",
  "package.adjust",
  "manifest.receive",
  "transfer.outgoing",
] as const;

export type MetrcOperation = (typeof METRC_OPERATIONS)[number];
