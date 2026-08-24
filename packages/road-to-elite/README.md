# road-to-elite

Combat Achievements tracker — "road to Elite" for the ironmen, with each
main account as reference. Live at <https://osrs.ramonfabrega.com/road-to-elite>.

`template.html` is the entire artifact: complete static page (design + all
client logic) with a single `__DATA__` marker. The worker (`apps/worker`)
bundles it as text and injects fresh data at request time — task catalog +
comp% from the OSRS wiki, per-account progress from WikiSync (server-side by
necessity: WikiSync Origin-allowlists browsers, see `docs/DESIGN.md`).
Upstream fetches are edge-cached ~5 min; account data updates on RuneLite
logout.

There is no build step. Players are configured in `apps/worker/src/data.ts`.
Open the template directly in a browser to work on design (the `__DATA__`
marker just renders no data); `bun test` in `apps/worker` covers the data
assembly.
