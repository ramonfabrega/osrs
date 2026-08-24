import { describe, expect, test } from "bun:test";
import { POINTS, assembleData, type WikiTask } from "./data";

const task = (id: number, tier: string, extra?: Partial<WikiTask>): WikiTask => ({
  id, tier, name: `t${id}`, monster: `m${id}`, task: `do ${id}`, type: "Kill Count", ...extra,
});

const synced = (ramon: number[], fernando: number[] = []) => ({
  ramon: { ironIds: ramon, mainIds: ramon },
  fernando: { ironIds: fernando, mainIds: fernando },
});

describe("assembleData", () => {
  test("sorts by tier points then comp% desc, nulls last", () => {
    const tasks = [task(1, "Elite"), task(2, "Easy"), task(3, "Easy"), task(4, "Easy")];
    const comp = { "3": 90.5, "2": 10.1 }; // task 4 has no comp%
    const data = assembleData(tasks, comp, synced([]), new Date("2026-08-24T00:00:00Z"));
    expect(data.tasks.map((t) => t.id)).toEqual([3, 2, 4, 1]);
    expect(data.tasks[0].c).toBe(90.5);
    expect(data.tasks[2].c).toBeNull();
  });

  test("filters synced ids to known tasks and sorts them", () => {
    const data = assembleData(
      [task(1, "Easy"), task(2, "Hard")],
      {},
      synced([2, 999, 1]),
      new Date("2026-08-24T00:00:00Z"),
    );
    const ramon = data.players.ramon as { ironIds: number[] };
    expect(ramon.ironIds).toEqual([1, 2]);
  });

  test("stamps a minute-resolution UTC timestamp", () => {
    const data = assembleData([task(1, "Easy")], {}, synced([]), new Date("2026-08-24T01:23:45Z"));
    expect(data.generated).toBe("2026-08-24 01:23 UTC");
  });

  test("tier points cover all six tiers", () => {
    expect(Object.values(POINTS)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
