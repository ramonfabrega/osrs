import { checkRandomCombos } from "./combos";
import { checkOnyxArb } from "./onyx";
import { checkPotionsArbs } from "./potions";
import { checkPartsArb, checkScalesArb } from "./zulrah";

while (true) {
  await checkPotionsArbs();
  await checkScalesArb();
  await checkPartsArb();
  await checkRandomCombos();
  await sleep();
}

async function sleep() {
  await new Promise((resolve) => setTimeout(resolve, 60000));
  console.log("-----sleep-----");
}
