import { checkOnyxArb } from "./onyx";
import { checkScalesArb } from "./zulrah";

while (true) {
  await checkScalesArb();
  await sleep();
}

async function sleep() {
  await new Promise((resolve) => setTimeout(resolve, 15000));
  console.log("-----sleep-----");
}
