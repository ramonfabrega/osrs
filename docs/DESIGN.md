# osrs — design narrative & decision log

## 2026-08-23 — the revive

Born as a one-off: a "road to Elite Combat Achievements" tracker for the
user's ironman, built in lore's well as a static HTML artifact on the CDN.
The one-off surfaced a structural gap, and the gap revived this repo.

### The tracker (road-to-elite)

Three data sources, all machine-readable:

| source | endpoint | access |
|---|---|---|
| task catalog (646 tasks) | `oldschool.runescape.wiki/api.php?action=bucket` — `bucket("combat_achievement")` | `ACAO: *` — browser-fetchable |
| comp% (crowdsourced completion) | `Module:Combat_Achievements/completion.json` via `action=raw` | `ACAO: *` — browser-fetchable |
| per-player progress | `sync.runescape.wiki/runelite/player/<name>/STANDARD` (WikiSync, updates on RuneLite logout) | **Origin-allowlisted** — browsers blocked |

Tier thresholds are cumulative points from **any** tier (Easy 41 / Med 161 /
Hard 419 / **Elite 1075** / Master 1940 / GM 2672), so Master/GM completions
push toward Elite. The page: hero stats, points meter with thresholds,
per-tier strip, filterable/sortable task table with a computed "Elite unlocks
here" cut line, by-boss grouped view, player toggle (Ramón / Fernando — two
accounts each, iron + main-as-reference).

### The CORS evidence (measured 2026-08-23)

`sync.runescape.wiki` filters by `Origin` header, not user-agent:

- custom UA, no Origin → **200**
- custom UA, `Origin: https://cdn.ramonfabrega.com` → **403**
- custom UA, `Origin: https://oldschool.runescape.wiki` → **200** (`ACAO: *`)

Browsers always send their real Origin on readable cross-origin requests;
`no-cors` responses are opaque; the endpoint is not JSONP. **A static page
therefore cannot fetch WikiSync live — by their policy, not by our
architecture.** Any liveness requires a server between the page and WikiSync.

### Rejected: WikiSync route in cdn-explorer

The CDN worker (dotfiles/cdn) already runs on every request and could proxy
in ~15 lines. Rejected by the user: *"cdn is agnostic / knows nothing about
wikisync/rs — a smell for it to be there."* Correct call — agnostic infra
must not accrete domain routes. The domain-owning worker belongs in the
domain-owning repo. Also rejected: third-party CORS proxies (a stranger's
free service in the load path).

### The estate survey that justified the umbrella

Same species (catalog × WikiSync × render), three serving stories:

- `games/rs/leagues` — league tasks × WikiSync, CLI (Ink/Pastel)
- `games/rs/unlocks` — ironman progression DAG, served over Tailscale
- `games/rs/stars` — Next.js; plus `packages/legacy` here (older stars/GE)
- road-to-elite — static CDN snapshot

Per the fleet's one-definition-many-surfaces doctrine: two hand-rolled
surfaces are fine, the third earns the shared home. Decisions (user-approved,
2026-08-23): **umbrella by gravity** (no forced migration), **everything on
the osrs domain** (pages + API same-origin), **revive to canon from lore,
first implementation session spawns here**.

### Keep vs throw away

The user explicitly allowed throwing the old repo away. Kept: the name, the
remote (`github.com/ramonfabrega/osrs`), the 6-line workspace package.json.
Quarantined: `packages/legacy` — it has **uncommitted work in the main
checkout** (`ge/dmm.ts`, `stars.ts` modified; `ge/dmm-ranarr.ts` untracked),
so deletion is the user's call, not a session's. Everything else on this
branch is fresh.

## v0 cut for the first session

1. **Worker scaffold** (`apps/worker` or `worker/`): Hono; static assets;
   `GET /api/wikisync/:name` → WikiSync with a proper UA, ~5 min cache,
   public. Mirror cdn-explorer's shape (Workers Builds off master,
   `custom_domain: osrs.ramonfabrega.com`, observability on).
2. **Cloudflare hookup** (the one human-in-loop step): connect the GitHub
   repo to Workers Builds, let wrangler provision the custom domain.
3. **Wire road-to-elite live**: page fetches `/api/wikisync/<name>` for the
   active player pair on load; baked data renders instantly as fallback;
   header states "live · synced …" vs "snapshot <date>" honestly. Keep
   `build.ts` — baked data remains the fallback and the offline path.
4. Retire the CDN copy (`cdn.ramonfabrega.com/osrs/road-to-elite.html`) or
   leave it as a frozen snapshot; the canonical URL becomes the osrs domain.

Non-goals for v0: migrating leagues/unlocks/stars, touching legacy, auth,
any model-driven anything.
