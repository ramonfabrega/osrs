import { loop } from "../utils";
import { fetchItem, formatItem, p, type Item } from "../utils/wiki";

const IDS = {
  TBOW: 20997,
  SCYTHE: 22486,
  SHADOW: 27277,
};

const fees = 5_000_000;

if (import.meta.main) loop(checkMythicsArb, 15_000);

export async function checkMythicsArb() {
  const [tbow, scythe, shadow] = await Promise.all([
    fetchItem(IDS.TBOW),
    fetchItem(IDS.SCYTHE),
    fetchItem(IDS.SHADOW),
  ]);

  console.log(
    [
      formatItem(tbow, "tbow", profit(tbow)),
      formatItem(scythe, "scythe", profit(scythe)),
      formatItem(shadow, "shadow", profit(shadow)),
    ].join("    |    ")
  );
}

function profit(item: Item) {
  return `p: ${p(item.high - fees - item.low).padStart(11, " ")}`;
}
