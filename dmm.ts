import { loop } from "./utils";
import { date, fetchItem, fetchItems, formatItem, p, type Item } from "./wiki";

import mappings from "./osrs-mappings.json";

if (import.meta.main) loop(checDmmArb, 15_000);

const NATURE_RUNE_PRICE = 200;

const map = new Map<number, (typeof mappings)[number]>();

mappings.forEach((m) => {
  map.set(m.id, m);
});

export async function checDmmArb() {
  const items = await fetchItems({ mode: "dmm" });

  // console.log(items);

  const fullItems = Object.entries(items.data)
    .map(([key, value]) => {
      const entry = map.get(parseInt(key));
      if (entry) {
        return {
          id: entry.id,
          name: entry.name,
          highalch: entry.highalch,
          limit: entry.limit,
          highDate: date(value.highTime),
          lowDate: date(value.lowTime),
          ...value,
        };
      } else {
        // console.log("failed to get entry", { key, value, entry });
      }
    })
    .filter((r) => r !== undefined)
    .filter((r) => {
      if (!r.highalch) return false;
      if (r.high < 100) return false;

      return calc(r.highalch, r.high) > 1000;
    })
    .filter((r) => r.high < 10_000)

    .sort((a, b) => {
      if (!a.highalch || !b.highalch) {
        return -1;
      }

      const _a = a.highalch - a.high;
      const _b = b.highalch - b.high;

      return _b - _a;
    });

  const prettyItems = fullItems
    .map((item) => {
      const high = p(calc(item.highalch || -10000, item.high));
      const low = p(calc(item.highalch || -10000, item.low));
      return formatItem(item, item.name, `${high} (${low})`);
    })
    .join("\n");

  // console.log(fullItems);
  console.log(prettyItems);
  console.log("--------------------");
}

function calc(alch: number, price: number) {
  return alch * 1.3 - NATURE_RUNE_PRICE - price;
}
