import { formatDistanceToNowStrict } from "date-fns";
import { loop } from "../utils";

if (import.meta.main) loop(checkStars, 60_000);

async function checkStars() {
  const data = await fetchStars();
  console.table(data);
}

async function fetchStars(): Promise<ParsedStar[]> {
  const res = await fetch("https://old.07.gg/shooting-stars/api/calls");
  const json = (await res.json()) as Star[];

  return json
    .filter(isTargetLocation)
    .filter(isTargetWorld)
    .filter(isRecentlyActive)
    .sort(sortStars)
    .map(transformStar);
}

function transformStar(s: Star): ParsedStar {
  const tstamp = new Date(s.calledAt);
  const key = typeof s.locationKey === "string" ? s.locationKey : "N/A";

  return {
    tier: s.tier,
    world: s.world,
    called: formatDistanceToNowStrict(tstamp),
    location: s.rawLocation,
    key,
  };
}

function sortStars(a: Star, b: Star) {
  if (a.tier === b.tier) return b.calledAt - a.calledAt;
  return b.tier - a.tier;
}

const IGNORED_WORLDS = [
  // f2p
  301, 308, 316, 326, 372, 379, 380, 381, 382, 383, 393, 398, 413, 414, 417,
  419, 427, 432, 434, 436, 437, 443, 455, 456, 468, 469, 483, 492, 497, 498,
  499, 530, 537, 552, 553, 554, 555, 571, 590, 622, 628, 648, 691,
  // 2k total
  349, 361, 363, 396, 415, 428, 450, 526, 527,
  // pvp
  345, 392, 401, 560, 561, 579, 581,
  // seasonal
];

const IGNORED_LOCATIONS = [
  "TRAHAEARN_MINE_ENTRANCE",
  "PIRATES_HIDEOUT_MINE",
  "MAGE_ARENA",
  "SOUTH_CRANDOR_MINE",
  "PISCATORIS_MINE",
  "JATIZSO_MINE_ENTRANCE",
  "CENTRAL_FREMENNIK_ISLES_MINE",
  "RELLEKKA_MINE",
  "NORTH_BRIMHAVEN_MINE",
  "EAST_LUMBRIDGE_SWAMP_MINE",
  "DENSE_ESSENCE_MINE",
  "FELDIP_HUNTER_AR2EA",
  "MOS_LEHARMLESS",
  "MOUNT_QUIDAMORTEM__BANK",
  "DWARVEN_MINE_NORTHERN_ENTRANCE",
  "VOLCANIC_MINE_ENTRANCE",
  "CIVITAS_ILLA_FORTIS__EAST_BANK",
  "RALOS_RISE_MINING_SITE",
  "MISTROCK_MINE",
  "CRAFTING_GUILD",
  "TAVERLEY__WHITE_WOLF_TUNNEL_ENTRANCE",
  "PORT_KHAZARD_MINE",
  "RANTZS_CAVE",
  "CATHERBY_BANK",
  "STONECUTTER_OUTPOST",
  "NARDAH",
  "LLETYA",
  "FELDIP_HUNTER_AREA",
  "FOSSIL_ISLAND_MINE",
  "BANDIT_CAMP_MINE__HOBGOBLINS",
  "LAVA_MAZE_RUNITE_MINE",
  "KARAMJA_JUNGLE_MINE__NATURE_ALTAR",
  "YANILLE_BANK",
  "SALVAGER_OVERLOOK_MINE",
  "GRAND_TREE",
  "SOUTH_BRIMHAVEN_MINE",
  "SOUTH_EAST_VARROCK_MINE",
  "LEGENDS_GUILD_MINE",
  "RESOURCE_AREA",
  "LUNAR_ISLE_MINE_ENTRANCE",
  "ABANDONED_MINE",
];
function isTargetLocation(star: Star) {
  if (typeof star.locationKey !== "string") return false;

  return !IGNORED_LOCATIONS.includes(star.locationKey);
}

function isTargetWorld(star: Star) {
  return !IGNORED_WORLDS.includes(star.world) && !isGridMasterWorld(star.world);
}

function isGridMasterWorld(w: number) {
  const r = (min: number, max = min) => w >= min && w <= max;

  if (
    r(384) ||
    r(397) ||
    r(399) ||
    r(418) ||
    r(430, 431) ||
    r(435) ||
    r(451, 454) ||
    r(488, 490) ||
    r(538, 547) ||
    r(574, 575) ||
    r(590, 618) ||
    r(622, 623) ||
    w >= 628
  )
    return true;

  return false;
}

function isRecentlyActive(star: Star) {
  // calledAt is less than 10min
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  return star.calledAt >= tenMinutesAgo;
}

type ParsedStar = {
  world: number;
  tier: number;
  key: string;
  location: string;
  called: string;
  // end: string;
};

type Star = {
  calledAt: number;
  caller: string;
  world: number;
  tier: number;
  locationKey: string | unknown;
  rawLocation: string;
  estimatedEnd: number;
};
