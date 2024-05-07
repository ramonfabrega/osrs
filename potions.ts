import { getLastBuy, getLastSell } from "./wiki";

const IDS = {
  RESTORES_4: 3024,
  RESTORES_3: 3026,
  BREW_4: 6685,
  BREW_3: 6687,
  STAMINA_4: 12625,
  STAMINA_3: 12627,
  PRAYER_3: 139,
  PRAYER_4: 2434,
};

export async function checkPotionsArbs() {
  const [brew, restore, stamina, prayer] = await Promise.all([
    checkArbitrage(IDS.BREW_4, IDS.BREW_3, 'Brew'),
    checkArbitrage(IDS.RESTORES_4, IDS.RESTORES_3, 'Restore'),
    checkArbitrage(IDS.STAMINA_4, IDS.STAMINA_3, 'Stamina'),
    checkArbitrage(IDS.PRAYER_4, IDS.PRAYER_3, 'Prayer'),
  ]);

  if (brew.profit > 0) {
    console.log(`Brew profit: ${brew.profit.toFixed(2)} | sell3: ${brew.sell3.price} | buy4: ${brew.buy4.price}`);
  }
  if (restore.profit > 0) {
    console.log(`Restore profit: ${restore.profit.toFixed(2)} | sell3: ${restore.sell3.price} | buy4: ${restore.buy4.price}`);
  }
  if (stamina.profit > 0) {
    console.log(`Stamina profit: ${stamina.profit.toFixed(2)} | sell3: ${stamina.sell3.price} | buy4: ${stamina.buy4.price}`);
  }
  if (prayer.profit > 0) {
    console.log(`Prayer profit: ${prayer.profit.toFixed(2)} | sell3: ${prayer.sell3.price} | buy4: ${prayer.buy4.price}`);
  }
}

async function checkArbitrage(id4: number, id3: number, name: string) {
  const buy4 = await getLastBuy(id4);
  const sell3 = await getLastSell(id3);
  const profit = buy4.price * 0.99 - (sell3.price / 0.75);
  return {buy4, sell3, profit};
}