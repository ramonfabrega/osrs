import { checkOnyxArb } from "./onyx";
import { checkPotionsArbs } from "./potions";
import { checkScalesArb } from "./zulrah";

while (true) {
  await checkPotionsArbs();
  await checkScalesArb();
  await sleep();
}

async function sleep() {
  await new Promise((resolve) => setTimeout(resolve, 60000));
  console.log("-----sleep-----");
}
