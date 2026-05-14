# Source archive

This directory archives the secondary research documents that informed the compliance dossier and monitoring registry. Files here are immutable historical record: when a value in `docs/compliance-dossier.md` cites `manus-2026-05-13 → ...`, the original Manus document is preserved here verbatim so we can audit what was claimed at the time.

Rules:

- Files in `docs/sources/<provider>-<date>/` are **never edited** after they land. New research overwrites by adding a new dated directory; old directories stay.
- Source files here are **not authoritative** for the kernel. The compliance kernel only accepts values that are encoded into `packages/compliance/src/rulesets/` with explicit verification status.
- A value transitioning from `secondary-cite-only` to `counsel-verified` does **not** delete the secondary citation — the source chain in the dossier preserves both, so future review can see the full provenance.

## Index

- `manus-2026-05-13/` — initial multi-state compliance landscape research from Manus AI. Five files: monitoring sources, Indiana prohibition findings, Illinois compliance findings, Michigan compliance findings, and the overall landscape / monitoring strategy.
