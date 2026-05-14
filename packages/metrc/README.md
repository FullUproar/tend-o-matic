# @tend-o-matic/metrc

Typed METRC client + outbox pattern + idempotency keys + retry policy. No real HTTP in v0.1 — sandbox credentials don't exist yet. The `NotImplementedMetrcClient` throws `MetrcCredentialsRequired` on every call.

## Outbox pattern

Every state change that needs to be reported to METRC writes a row to `metrc_outbox` in the same transaction as the local mutation. A worker drains the outbox with idempotency keys and retries. Internet outages cannot stop sales.

When Michigan sandbox credentials are provisioned, the real client implementation slots into the `MetrcClient` interface without changing the rest of the stack.
