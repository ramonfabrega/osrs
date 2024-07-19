import { formatDistanceToNowStrict } from "date-fns";
export type Item = Record<"high" | "low" | "highTime" | "lowTime", number>;

type WikiResponse = {
  data: {
    [id in string]: Item;
  };
};

type FetchItemParams = { id?: number; mode?: "dmm" | "osrs" };
export async function fetchItems(params: {
  mode?: "dmm" | "osrs";
}): Promise<WikiResponse>;
export async function fetchItems(params: {
  id: number;
  mode?: "dmm" | "osrs";
}): Promise<Item>;
export async function fetchItems({ id, mode = "osrs" }: FetchItemParams) {
  const res = await fetch(
    `https://prices.runescape.wiki/api/v1/${mode}/latest${
      id ? `?id=${id}` : ""
    }`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch item ${id}`);
  }

  const json = (await res.json()) as WikiResponse;

  if (id && id in json.data) {
    return json.data[id];
  }

  return json;
}
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

export function formatItem(item: Item, label = "", extra = "") {
  const tstampHigh = new Date(item.highTime * 1000);
  const timeHigh = d(tstampHigh);
  const tstampLow = new Date(item.lowTime * 1000);
  const timeLow = d(tstampLow);

  const l = `${label}:`.padEnd(6);
  const high = `h: ${p(item.high)} | ${timeHigh}`;
  const low = `l: ${p(item.low)} | ${timeLow}`;
  const e = extra ? `| ${extra}` : "";

  return `${l} ${high} | ${low} ${e}`;
}

export async function logItem(item: Item, label = "", extra = "") {
  const tstampHigh = new Date(item.highTime * 1000);
  const timeHigh = d(tstampHigh);
  const tstampLow = new Date(item.lowTime * 1000);
  const timeLow = d(tstampLow);

  const l = `${label}:`.padEnd(10);
  const high = `h: ${p(item.high)} | ${timeHigh}`;
  const low = `l: ${p(item.low)} | ${timeLow}`;
  const e = extra ? `|| ${extra}` : "";

  console.log(`${l} ${high} || ${low} ${e}`);
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

export function p(n: number) {
  return Math.floor(n).toLocaleString();
}

function d(date: Date) {
  const fullText = formatDistanceToNowStrict(date);
  return fullText
    .replace(/ years?/, "y")
    .replace(/ months?/, "mo")
    .replace(/ weeks?/, "w")
    .replace(/ days?/, "d")
    .replace(/ hours?/, "h")
    .replace(/ minutes?/, "m")
    .replace(/ seconds?/, "s")
    .padEnd(3, " ");
}

export function date(tstamp: number) {
  return d(new Date(tstamp * 1000));
}

export async function logCombo(
  inputIds: number[],
  outputId: number,
  desiredProfit: number = 100000
) {
  const input = await Promise.all(inputIds.map(getLastSell));
  const output = await getLastBuy(outputId);
  // calculate profit
  const inputCost = input.reduce((acc, i) => acc + i.price, 0);
  const profit = output.price * 0.99 - inputCost;
  if (profit > desiredProfit) {
    console.log(
      `Input: ${input.map((i) => i.price).join(", ")} | Output: ${
        output.price
      } | Profit: ${profit}`
    );
  }
}
