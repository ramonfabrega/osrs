// Data plumbing for OSRS pages: wiki task catalog + crowdsourced comp% +
// per-account WikiSync progress, assembled into the shape the pages bake.
//
// All upstream fetches ride Cloudflare's edge cache (~5 min): the wiki data
// moves slowly and WikiSync only updates on RuneLite logout, so per-request
// freshness at that granularity is indistinguishable from live.
//
// WikiSync MUST be fetched server-side: sync.runescape.wiki 403s any browser
// Origin except the wiki's own (measured 2026-08-23, matrix in docs/DESIGN.md).

const UA = "osrs.ramonfabrega.com/1.0 (github.com/ramonfabrega/osrs)";
const CACHE_TTL = 300;

export const PLAYERS = {
  ramon: { label: "Ramón", iron: "fe rmn", main: "r amon" },
  fernando: { label: "Fernando", iron: "solocapo", main: "greenbay420" },
} as const;

export const POINTS: Record<string, number> = {
  Easy: 1, Medium: 2, Hard: 3, Elite: 4, Master: 5, Grandmaster: 6,
};

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    cf: { cacheEverything: true, cacheTtl: CACHE_TTL },
  } as RequestInit);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return JSON.parse(await res.text()); // completion.json ships as text/plain
}

const BUCKET_QUERY =
  'bucket("combat_achievement").select("id","name","monster","task","tier","type","league_region").limit(5000).run()';

export type WikiTask = {
  id: number; name: string; monster: string; task: string; tier: string; type: string;
};

export async function fetchTasks(): Promise<WikiTask[]> {
  const data = (await getJson(
    `https://oldschool.runescape.wiki/api.php?action=bucket&format=json&query=${encodeURIComponent(BUCKET_QUERY)}`,
  )) as { bucket: WikiTask[] };
  if (!Array.isArray(data.bucket) || data.bucket.length < 500)
    throw new Error(`bucket returned ${data.bucket?.length ?? 0} tasks — expected 600+`);
  return data.bucket;
}

export const fetchComp = () =>
  getJson(
    "https://oldschool.runescape.wiki/index.php?title=Module:Combat_Achievements/completion.json&action=raw",
  ) as Promise<Record<string, number>>;

export async function fetchWikiSync(player: string): Promise<{ combat_achievements: number[] }> {
  const data = (await getJson(
    `https://sync.runescape.wiki/runelite/player/${encodeURIComponent(player)}/STANDARD`,
  )) as { combat_achievements?: number[] };
  if (!Array.isArray(data.combat_achievements))
    throw new Error(`${player}: no combat_achievements in WikiSync payload`);
  return { combat_achievements: data.combat_achievements };
}

// Pure assembly — unit-tested; everything above is I/O.
export function assembleData(
  tasks: WikiTask[],
  comp: Record<string, number>,
  synced: Record<string, { ironIds: number[]; mainIds: number[] }>,
  now: Date,
) {
  const valid = new Set(tasks.map((t) => t.id));
  const clean = (ids: number[]) => ids.filter((id) => valid.has(id)).sort((a, b) => a - b);
  const players: Record<string, unknown> = {};
  for (const [key, p] of Object.entries(PLAYERS)) {
    const s = synced[key];
    if (!s) throw new Error(`no synced ids for player ${key}`);
    players[key] = { ...p, ironIds: clean(s.ironIds), mainIds: clean(s.mainIds) };
  }
  return {
    generated: now.toISOString().slice(0, 16).replace("T", " ") + " UTC",
    tasks: [...tasks]
      .sort((a, b) => POINTS[a.tier] - POINTS[b.tier] || (comp[b.id] ?? -1) - (comp[a.id] ?? -1))
      .map((t) => ({
        id: t.id, n: t.name, m: t.monster, d: t.task, t: t.tier, y: t.type,
        c: comp[String(t.id)] ?? null,
      })),
    players,
  };
}

export async function liveData(now: Date) {
  const entries = Object.entries(PLAYERS);
  const [tasks, comp, ...syncs] = await Promise.all([
    fetchTasks(),
    fetchComp(),
    ...entries.flatMap(([, p]) => [fetchWikiSync(p.iron), fetchWikiSync(p.main)]),
  ]);
  const synced: Record<string, { ironIds: number[]; mainIds: number[] }> = {};
  entries.forEach(([key], i) => {
    synced[key] = {
      ironIds: syncs[i * 2].combat_achievements,
      mainIds: syncs[i * 2 + 1].combat_achievements,
    };
  });
  return assembleData(tasks, comp, synced, now);
}
