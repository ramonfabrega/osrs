import { loop } from "../utils";
import { fetchItem, formatItem, p, type Item } from "../utils/wiki";

const ID = 31088;
const IDS = {
  BOOTS: 31088,
  STAFF: 31115,
  GLOVES: 31106,
};

const fees = 5_000_000;

if (import.meta.main) loop(checkAvernic, 15_000);

export async function checkAvernic() {
  const [boots, staff, gloves] = await Promise.all([
    fetchItem(IDS.BOOTS),
    fetchItem(IDS.STAFF),
    fetchItem(IDS.GLOVES),
  ]);

  console.log(
    [
      formatItem(boots, "boots", profit(boots)),
      formatItem(staff, "staff", profit(staff)),
      formatItem(gloves, "gloves", profit(gloves)),
    ].join("    |    ")
  );
}

function profit(item: Item) {
  return `p: ${p(item.high - fees - item.low).padStart(11, " ")}`;
}
