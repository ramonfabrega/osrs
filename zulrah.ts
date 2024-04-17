import { getLastBuy, getLastSell } from "./wiki";

const IDS = {
  SCALES: 12934,
  VISAGE: 12927,
  HELM: 12929,
  TANZ: 12922,
  MAGIC: 12932,
};

export async function checkScalesArb() {
  const scales = await getScaleInfo();
  console.log(scales);
  await checkItems();
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
