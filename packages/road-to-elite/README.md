# road-to-elite

Combat Achievements tracker — "road to Elite" for the ironmen, with each
main account as reference. Single static HTML file, all data baked in.

```
bun build.ts    # fetches catalog + comp% + WikiSync for all players
                # → dist/road-to-elite.html
```

Publish (until the osrs worker serves it):

```
~/code/personal/dotfiles/bin/share dist/road-to-elite.html osrs/road-to-elite.html --permanent
```

Same key every time — the URL never changes. Players are configured at the
top of `build.ts`. WikiSync data updates when the account logs out of
RuneLite; regen any time. Why this is a regen and not a live fetch:
`docs/DESIGN.md` (WikiSync Origin-allowlists browsers).

`template.html` is the page (design + all client logic); `__DATA__` is the
only injection point.
