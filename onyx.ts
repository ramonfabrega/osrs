import { fetchItem, getLastBuy, getLastSell, logItem } from "./wiki";

const IDS = {
  UNCUT_ONYX: 6571,
  CUT_ONYX: 6573,
  ZENYTE_SHARD: 19529,
  TORTURE: 19553,
  ANGUISH: 19547,
  TORMENTED: 19544,
  SUFFERING: 19550,
};

export async function checkOnyxArb() {
  const [uncut_onyx, cut_onyx, zenyte, torture, anguish, tormented, suffering] =
    await Promise.all([
      fetchItem(IDS.UNCUT_ONYX),
      fetchItem(IDS.CUT_ONYX),
      fetchItem(IDS.ZENYTE_SHARD),
      fetchItem(IDS.TORTURE),
      fetchItem(IDS.ANGUISH),
      fetchItem(IDS.TORMENTED),
      fetchItem(IDS.SUFFERING),
    ]);

  logItem(uncut_onyx, "uncut_onyx");
  logItem(cut_onyx, "cut_onyx  ");
  logItem(zenyte, "zenyte    ");
  logItem(torture, "torture   ");
  logItem(anguish, "anguish   ");
  logItem(tormented, "tormented ");
  logItem(suffering, "suffering ");
}
