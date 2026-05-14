# Deployment

## Vercel

The repo root **does not deploy**. `vercel.json` at root sets
`ignoreCommand: "exit 0"` so the root Vercel project no-ops cleanly
instead of fighting with monorepo build semantics.

Each app is its own Vercel project. Configure them like this:

| Vercel project       | Root Directory     | Framework preset |
|----------------------|--------------------|------------------|
| tend-o-matic-till    | `apps/till`        | Next.js          |
| tend-o-matic-bo      | `apps/backoffice`  | Next.js          |
| tend-o-matic-portal  | `apps/portal`      | Next.js          |

For each project:

- **Install Command:** leave default. Vercel auto-detects `pnpm` from
  the root `packageManager` field (`pnpm@9.7.0`) via corepack.
- **Build Command:** leave default (`next build`).
- **Output Directory:** leave default (`.next`).
- **Node version:** 20.x.

If install fails on pnpm version, enable corepack in project settings
(Vercel → Project Settings → General → "Enable corepack") so it picks
up the version pinned in `packageManager`.

## Why not a single root project

Three separate Next.js apps with distinct routing, domains, and
operational profiles (the till is offline-first; portal is
super-admin) do not collapse cleanly into one deployment. Splitting by
app keeps each surface's domain, env vars, preview deploys, and rollout
independent — which matters when the till is touching live sales and
the portal is not.

## Branches

- `main` — protected; production deploys for each app target it.
- feature branches — Vercel preview deploys, one per app project.

No deployment strategy is encoded in this PR beyond "the root doesn't
deploy." Domain assignment, env vars, and CDN / regional config are
open decisions for when a launch partner is confirmed.
