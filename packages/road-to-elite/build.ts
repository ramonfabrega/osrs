#!/usr/bin/env bun
// road-to-elite regen: fetch the OSRS wiki task catalog + crowdsourced comp% +
// WikiSync progress for every configured account, bake into template.html.
//
//   bun build.ts            → dist/road-to-elite.html
//
// WikiSync data updates on RuneLite logout. This runs server-side on purpose:
// sync.runescape.wiki 403s any browser Origin except the wiki's own (see
// docs/DESIGN.md), so a static page cannot fetch it live — regen and re-publish.

const PLAYERS = {
  ramon: { label: "Ramón", iron: "fe rmn", main: "r amon" },
  fernando: { label: "Fernando", iron: "solocapo", main: "greenbay420" },
} as const;

const UA = "osrs-road-to-elite/1.0 (github.com/ramonfabrega/osrs)";
const POINTS: Record<string, number> = {
  Easy: 1, Medium: 2, Hard: 3, Elite: 4, Master: 5, Grandmaster: 6,
};

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return JSON.parse(await res.text()); // completion.json ships as text/plain
}

const BUCKET_QUERY =
  'bucket("combat_achievement").select("id","name","monster","task","tier","type","league_region").limit(5000).run()';

type WikiTask = {
  id: number; name: string; monster: string; task: string; tier: string; type: string;
};

async function fetchTasks(): Promise<WikiTask[]> {
  const data = (await getJson(
    `https://oldschool.runescape.wiki/api.php?action=bucket&format=json&query=${encodeURIComponent(BUCKET_QUERY)}`,
  )) as { bucket: WikiTask[] };
  if (!Array.isArray(data.bucket) || data.bucket.length < 500)
    throw new Error(`bucket returned ${data.bucket?.length ?? 0} tasks — expected 600+`);
  return data.bucket;
}

const fetchComp = () =>
  getJson(
    "https://oldschool.runescape.wiki/index.php?title=Module:Combat_Achievements/completion.json&action=raw",
  ) as Promise<Record<string, number>>;

async function fetchSyncedIds(player: string, valid: Set<number>): Promise<number[]> {
  const data = (await getJson(
    `https://sync.runescape.wiki/runelite/player/${encodeURIComponent(player)}/STANDARD`,
  )) as { combat_achievements?: number[] };
  if (!Array.isArray(data.combat_achievements))
    throw new Error(`${player}: no combat_achievements in WikiSync payload`);
  return data.combat_achievements.filter((id) => valid.has(id)).sort((a, b) => a - b);
}

const [tasks, comp] = await Promise.all([fetchTasks(), fetchComp()]);
const valid = new Set(tasks.map((t) => t.id));

const players: Record<string, Record<string, unknown>> = {};
for (const [key, p] of Object.entries(PLAYERS)) {
  const [ironIds, mainIds] = await Promise.all([
    fetchSyncedIds(p.iron, valid),
    fetchSyncedIds(p.main, valid),
  ]);
  players[key] = { ...p, ironIds, mainIds };
  const pts = (ids: number[]) => {
    const set = new Set(ids);
    return tasks.reduce((s, t) => s + (set.has(t.id) ? POINTS[t.tier] : 0), 0);
  };
  console.log(`${p.label}: ${p.iron} ${ironIds.length} tasks / ${pts(ironIds)} pts · ${p.main} ${mainIds.length} tasks / ${pts(mainIds)} pts`);
}

const data = {
  generated: new Date().toISOString().slice(0, 10),
  tasks: tasks
    .sort((a, b) => POINTS[a.tier] - POINTS[b.tier] || (comp[b.id] ?? -1) - (comp[a.id] ?? -1))
    .map((t) => ({
      id: t.id, n: t.name, m: t.monster, d: t.task, t: t.tier, y: t.type,
      c: comp[String(t.id)] ?? null,
    })),
  players,
};

const template = await Bun.file(new URL("template.html", import.meta.url)).text();
if (!template.includes("__DATA__")) throw new Error("template.html has no __DATA__ marker");
const out = template.replace("__DATA__", JSON.stringify(data));
const dest = new URL("dist/road-to-elite.html", import.meta.url);
await Bun.write(dest, out);
console.log(`${tasks.length} tasks → ${dest.pathname} (${(out.length / 1024).toFixed(0)}KB)`);
