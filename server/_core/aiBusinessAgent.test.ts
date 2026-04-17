import { describe, it, expect, vi } from "vitest";

vi.mock("./aiDecisionEngine", () => ({
  generateNextActions: vi.fn(async () => ({
    priority: "high",
    actions: [{ type: "analyze_metrics", reason: "baseline" }],
  })),
}));

import { AIBusinessAgentManager } from "./aiBusinessAgent";

describe("AIBusinessAgentManager", () => {
  it("runs sense -> decide -> act -> learn and records memory", async () => {
    const manager = new AIBusinessAgentManager();

    const state = manager.start(1, 7, 30, {
      sense: async ({ businessId, state: current }) => ({
        businessId: String(businessId),
        metrics: {
          traffic: 100 + current.cycleCount,
          conversions: 10,
          revenue: 1000,
        },
        recentActions: current.recentActions,
        memory: current.memory,
        systemHealth: {
          errors: 0,
          uptime: 60,
        },
      }),
      executeAction: async () => ({ summary: "done" }),
    });

    expect(state.running).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 25));
    const afterRun = manager.get(1, 7);

    expect(afterRun?.cycleCount).toBeGreaterThanOrEqual(1);
    expect(afterRun?.memory.length).toBeGreaterThan(0);
    expect(afterRun?.recentActions[afterRun.recentActions.length - 1]).toBe("analyze_metrics");

    const stopped = manager.stop(1, 7);
    expect(stopped?.running).toBe(false);
  });
});
