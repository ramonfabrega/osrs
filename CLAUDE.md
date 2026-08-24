# osrs

The OSRS umbrella: the web surface (`osrs.ramonfabrega.com`) plus shared
plumbing for the one-off trackers and tools that keep getting built around
Old School RuneScape. Revived 2026-08-23 from a dormant monorepo shell; the
name and remote were kept, everything else here is written fresh.

## Thesis

OSRS one-offs are the same species — **task catalog × WikiSync × render** —
and keep being rebuilt standalone with ad-hoc serving: `games/rs/leagues`
(CLI), `games/rs/unlocks` (Tailscale), `games/rs/stars` (Next), road-to-elite
(static CDN snapshot). Three hand-rolled instances earned the shared home.
This repo owns the domain and the plumbing; **migration is by gravity** —
siblings move in only when they want the surface, never as a consolidation
project. (This repo already stalled once as a consolidation attempt; the
lesson is baked in.)

## Architecture

- Bun monorepo (`packages/*`, `apps/*`).
- **`packages/road-to-elite`** — first tenant. Combat Achievements tracker
  (static HTML, all data baked; `build.ts` regenerates). Live at
  `cdn.ramonfabrega.com/osrs/road-to-elite.html` until the worker exists.
- **Worker (v0, not yet built)** — one Hono worker serving static pages +
  `/api/wikisync/:name` (server-side proxy to `sync.runescape.wiki`, short
  cache, public). Same deploy shape as dotfiles/cdn `cdn-explorer`: Workers
  Builds off `master`, custom domain `osrs.ramonfabrega.com`. Pages and API
  are same-origin → zero CORS anywhere.
- **`packages/legacy`** — quarantined pre-revive code (stars/GE/stream, Oct
  2025). Has uncommitted local changes in the main checkout (`dmm.ts`,
  `stars.ts`, `dmm-ranarr.ts`) — do not delete without the user; dissect or
  drop is an open call.

## Locked decisions (rationale in docs/DESIGN.md)

- **WikiSync is proxied server-side, never fetched from the browser.** Their
  Origin allowlist 403s every non-wiki browser Origin — measured, not
  assumed. The wiki's own APIs (Bucket, module raw) are `ACAO: *` and may be
  fetched from anywhere.
- **Static-first pages.** Data baked at build; live fetch is progressive
  enhancement once the worker exists (baked data stays as the instant-render
  fallback, pages state their snapshot honestly).
- **Public surface, no auth** — everything served is read-only public game
  data.
- **The RS-specific never leaks into agnostic infra.** The CDN worker stays
  ignorant of RuneScape; that smell is why this repo owns the domain.

## Conventions

- Bun-first (`Bun.file`, `Bun.write`, `bun:test`); boundary validation on
  I/O (zod once a package earns dependencies; v0 scripts guard-check
  inline).
- Every page self-reports its data provenance and snapshot date.

## Fan-out doctrine (does not travel — lives here on purpose)

- **Subscription OAuth only.** Never an API key; in-session subagent fan-out
  is the parallel lane.
- Ad-hoc spawns of generic agent types MUST pass an explicit model
  (sonnet default; haiku for bulk) — omission inherits the main loop's
  frontier model.
- VERIFY served model from the spawn's task-output JSONL (`"model":"..."` on
  the first request), never the spawn parameter or completion notification.
- Ledger every fan-out: per agent — scope, tokens, tools, duration,
  verified model.

## References

- `docs/DESIGN.md` — decision log (revive, CORS evidence, v0 cut).
- Siblings: `~/code/games/rs/{leagues,unlocks,stars,bank-tags,runelite-mobile}`,
  `~/code/fun/lumbridge` (local sandbox — separate world, stays put).
- Wiki state page: `~/code/personal/lore-wiki/projects/osrs.md`.
- The user operates suggest-first — challenge premises, propose alternatives.
