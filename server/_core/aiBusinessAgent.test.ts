import { describe, it, expect } from "vitest";
import { AIBusinessAgentManager } from "./aiBusinessAgent";

describe("AIBusinessAgentManager", () => {
  it("starts, runs cycles, and stops", async () => {
    const manager = new AIBusinessAgentManager();
    let runs = 0;

    const state = manager.start(1, 7, 30, async () => {
      runs += 1;
      return { action: "test", detail: `run-${runs}` };
    });

    expect(state.running).toBe(true);

    const afterRun = await manager.runNow(1, 7, async () => {
      runs += 1;
      return { action: "manual", detail: `run-${runs}` };
    });

    expect(afterRun?.cycleCount).toBeGreaterThanOrEqual(1);
    expect(afterRun?.logs.some((log) => log.message.includes("run-"))).toBe(true);

    const stopped = manager.stop(1, 7);
    expect(stopped?.running).toBe(false);
  });
});
