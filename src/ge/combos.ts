import { getLastBuy, getLastSell, logCombo } from "../utils/wiki";

const IDS = {
  HYDRA_CLAW: 22966,
  ZAMORAKIAN_HASTA: 11889,
  DRAGON_HUNTER_LANCE: 22978,
  MASORI_SET_F: 27355,
  MASORI_MASK_F: 27235,
  MASORI_BODY_F: 27238,
  MASORI_CHAPS_F: 27241,
  INQUISITOR_SET: 24488,
  INQUISITOR_HELM: 24419,
  INQUISITOR_HAUBERK: 24420,
  INQUISITOR_LEGS: 24421,
  JUSTICIAR_SET: 22438,
  JUSTICIAR_FACE: 22326,
  JUSTICIAR_CHEST: 22327,
  JUSTICIAR_LEGS: 22328,
  VENATOR_SHARD: 27614,
  VENATOR_BOW: 27612,
};

export async function checkRandomCombos() {
  console.log("Dragon Hunter Lance");
  await logCombo(
    [IDS.HYDRA_CLAW, IDS.ZAMORAKIAN_HASTA],
    IDS.DRAGON_HUNTER_LANCE,
    1000 * 1000
  );
  console.log("Masori F set");
  await logCombo(
    [IDS.MASORI_MASK_F, IDS.MASORI_BODY_F, IDS.MASORI_CHAPS_F],
    IDS.MASORI_SET_F,
    2000 * 1000
  );
  console.log("Inquisitor Set");
  await logCombo(
    [IDS.INQUISITOR_HELM, IDS.INQUISITOR_HAUBERK, IDS.INQUISITOR_LEGS],
    IDS.INQUISITOR_SET,
    3000 * 1000
  );
  console.log("Justiciar Set");
  await logCombo(
    [IDS.JUSTICIAR_FACE, IDS.JUSTICIAR_CHEST, IDS.JUSTICIAR_LEGS],
    IDS.JUSTICIAR_SET,
    1500 * 1000
  );
  console.log("Venator Bow");
  await logCombo(
    [
      IDS.VENATOR_SHARD,
      IDS.VENATOR_SHARD,
      IDS.VENATOR_SHARD,
      IDS.VENATOR_SHARD,
      IDS.VENATOR_SHARD,
    ],
    IDS.VENATOR_BOW,
    500 * 1000
  );
}
