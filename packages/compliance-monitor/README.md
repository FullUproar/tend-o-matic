# @tend-o-matic/compliance-monitor

Typed scaffolding for the compliance change-detection system: `Source`, `Snapshot`, `Diff`, `Alert` (category × tier), plus a seed `SOURCE_REGISTRY` of Michigan + Illinois official monitoring URLs derived from `docs/compliance-monitoring.md`.

v0.1 ships only types and the registry. No fetcher, no diff engine, no notifier — those are Phase 2+ work. The registry is the operational moat input: when sources change, alerts route into the manager inbox classified by product surface, and ruleset proposals flow back into `packages/compliance/src/rulesets/`.
