import { formatDistanceToNowStrict } from "date-fns";
type Item = Record<"high" | "low" | "highTime" | "lowTime", number>;

type WikiResponse = {
  data: {
    [id in string]: Item;
  };
};

export async function fetchItem(id: number) {
  const res = await fetch(
    `https://prices.runescape.wiki/api/v1/osrs/latest?id=${id}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch item ${id}`);
  }

  const json = (await res.json()) as WikiResponse;

  if (id in json.data) {
    return json.data[id];
  } else {
    throw new Error(`Failed to fetch item ${id}`);
  }
}

export async function logItem(item: Item, label = "") {
  const tstampHigh = new Date(item.highTime * 1000);
  const timeHigh = formatDistanceToNowStrict(tstampHigh);
  const tstampLow = new Date(item.lowTime * 1000);
  const timeLow = formatDistanceToNowStrict(tstampLow);

  console.log(
    `${label} h: ${item.high} | ${timeHigh} l: ${item.low} | ${timeLow}`
  );
}

export async function getLastBuy(id: number) {
  const item = await fetchItem(id);

  const tstamp = new Date(item.highTime * 1000);
  const time = formatDistanceToNowStrict(tstamp);

  return { price: item.high, time };
}

export async function getLastSell(id: number) {
  const item = await fetchItem(id);

  const tstamp = new Date(item.lowTime * 1000);
  const time = formatDistanceToNowStrict(tstamp);

  return { price: item.low, time };
}
