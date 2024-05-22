import { getLastBuy, getLastSell, logCombo } from "./wiki";

const IDS = {
  SCALES: 12934,
  VISAGE: 12927,
  HELM: 12929,
  TANZ: 12922,
  MAGIC: 12932,
  TRIDENT: 11908,
  TOXIC_TRIDENT: 12900,
  STAFF_OF_DEAD: 11791,
  TOXIC_STAFF: 12902,
};

export async function checkScalesArb() {
  const scales = await getScaleInfo();
  console.log(scales);
  await checkItems();
}

export async function checkPartsArb() {
  console.log("Toxic Staff");
  await logCombo([IDS.STAFF_OF_DEAD, IDS.MAGIC], IDS.TOXIC_STAFF);
  console.log("Toxic Trident");
  await logCombo([IDS.TRIDENT, IDS.MAGIC], IDS.TOXIC_TRIDENT);
  console.log("Tanz Helm");
  await logCombo([IDS.VISAGE], IDS.HELM);
}

async function checkItems() {
  const [visage, helm, tanz, magic] = await Promise.all([
    getLastSell(IDS.VISAGE),
    getLastSell(IDS.HELM),
    getLastSell(IDS.TANZ),
    getLastSell(IDS.MAGIC),
  ]);

  console.log(`visage: ${visage.price} | ${visage.time}`);
  console.log(`helm  : ${helm.price} | ${helm.time}`);
  console.log(`tanz  : ${tanz.price} | ${tanz.time}`);
  console.log(`magic : ${magic.price} | ${magic.time}`);
}

async function getScaleInfo() {
  const { price } = await getLastBuy(IDS.SCALES);
  const total = price * 20000;
  return { price, total };
}

// async function getToxicTridentInfo() {
//   const { price } = await getLastBuy(IDS.TRIDENT);
//   const toxic = await getLastSell(IDS.TOXIC_TRIDENT);
//   const profit = price * 0.99 - toxic.price;
//   return { price, toxic, profit };
// }

// async function getToxicStaffInfo() {
//   const { price : toxicStaffPrice } = await getLastBuy(IDS.TOXIC_STAFF);
//   const 
//   const toxic = await getLastSell(IDS.TOXIC_TRIDENT);
//   const profit = price * 0.99 - toxic.price;
//   return { price, toxic, profit };
// }
