export async function sleep(ms = 60000) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loop(fn: () => Promise<void>, ms?: number) {
  while (true) {
    await fn();
    await sleep(ms);
  }
}
