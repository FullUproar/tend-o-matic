# Performance budget

These are **regression targets, not aspirations**. A change that pushes any
of these past its budget without explicit, documented sign-off is a
regression and should fail review.

## Front-of-house benchmarks

- **Scan-to-cart latency:** < 200 ms, online OR offline.
- **New customer + ID scan + age check:** < 8 s.
- **3-item cash sale end-to-end:** < 30 s.
- **Network drop mid-cart:** zero data loss, zero modal.
- **Crash + reload:** cart restored where it was.

## How we hold the line

- Each benchmark gets an automated measurement in CI, on a fixed-hardware
  reference profile, against a synthetic ruleset and catalog. The CI job
  asserts the budget; it does not just report it.
- Offline behavior is a tested code path, not a degraded fallback. The
  till works without a network as the default assumption.
- "Zero modal" on network drop is literal. The cashier should not be
  notified of network state during a sale — only the back-office should
  surface it, and only when action is needed.
- Cart state is durable on the device, written before render, restored on
  reload without prompting.
