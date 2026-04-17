import {
  BrainActionType,
  BrainDecision,
  BrainInput,
  generateNextActions,
} from "./aiDecisionEngine";

export type AgentMemoryEntry = {
  timestamp: string;
  action: BrainActionType;
  reason: string;
  result: string;
  metricsBefore: BrainInput["metrics"];
  metricsAfter: BrainInput["metrics"];
};

export type AgentState = {
  userId: number;
  businessId: number;
  running: boolean;
  intervalSeconds: number;
  startedAt: string;
  nextRunAt: string;
  lastRunAt: string | null;
  cycleCount: number;
  currentAction: string | null;
  lastError: string | null;
  recentActions: string[];
  lastDecision: BrainDecision | null;
  memory: AgentMemoryEntry[];
  logs: Array<{
    at: string;
    level: "info" | "error";
    message: string;
  }>;
};

export type AgentLoopDeps = {
  sense: (ctx: { userId: number; businessId: number; state: AgentState }) => Promise<BrainInput>;
  executeAction: (ctx: {
    userId: number;
    businessId: number;
    action: BrainDecision["actions"][number];
    state: AgentState;
  }) => Promise<{ summary: string }>;
};

const MAX_LOGS = 100;
const MAX_MEMORY = 200;

function keyFor(userId: number, businessId: number): string {
  return `${userId}:${businessId}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export class AIBusinessAgentManager {
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly states = new Map<string, AgentState>();

  private pushLog(state: AgentState, level: "info" | "error", message: string) {
    state.logs.unshift({ at: nowIso(), level, message });
    if (state.logs.length > MAX_LOGS) {
      state.logs.length = MAX_LOGS;
    }
  }

  private pushMemory(state: AgentState, entry: AgentMemoryEntry) {
    state.memory.push(entry);
    if (state.memory.length > MAX_MEMORY) {
      state.memory.splice(0, state.memory.length - MAX_MEMORY);
    }
    state.recentActions = state.memory.slice(-5).map((item) => item.action);
  }

  private async tick(state: AgentState, deps: AgentLoopDeps): Promise<void> {
    if (!state.running || state.currentAction) {
      return;
    }

    state.currentAction = "sense";
    state.lastRunAt = nowIso();

    try {
      const before = await deps.sense({
        userId: state.userId,
        businessId: state.businessId,
        state,
      });

      state.currentAction = "decide";
      const decision = await generateNextActions({
        ...before,
        recentActions: state.recentActions,
        memory: state.memory,
      });
      state.lastDecision = decision;
      this.pushLog(
        state,
        "info",
        `Decision priority=${decision.priority} actions=${decision.actions
          .map((action) => action.type)
          .join(",")}`
      );

      for (const action of decision.actions) {
        state.currentAction = `act:${action.type}`;
        const result = await deps.executeAction({
          userId: state.userId,
          businessId: state.businessId,
          action,
          state,
        });

        state.currentAction = "learn";
        const after = await deps.sense({
          userId: state.userId,
          businessId: state.businessId,
          state,
        });
        this.pushMemory(state, {
          timestamp: nowIso(),
          action: action.type,
          reason: action.reason,
          result: result.summary,
          metricsBefore: before.metrics,
          metricsAfter: after.metrics,
        });
        this.pushLog(state, "info", `${action.type}: ${result.summary}`);
      }

      state.cycleCount += 1;
      state.nextRunAt = new Date(Date.now() + state.intervalSeconds * 1000).toISOString();
      state.lastError = null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      state.lastError = message;
      state.nextRunAt = new Date(Date.now() + state.intervalSeconds * 1000).toISOString();
      this.pushLog(state, "error", message);
    } finally {
      state.currentAction = null;
    }
  }

  start(userId: number, businessId: number, intervalSeconds: number, deps: AgentLoopDeps): AgentState {
    const key = keyFor(userId, businessId);
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    const state: AgentState = {
      userId,
      businessId,
      running: true,
      intervalSeconds,
      startedAt: nowIso(),
      nextRunAt: nowIso(),
      lastRunAt: null,
      cycleCount: 0,
      currentAction: null,
      lastError: null,
      recentActions: [],
      lastDecision: null,
      memory: [],
      logs: [],
    };
    this.pushLog(state, "info", `Agent started with ${intervalSeconds}s cadence`);
    this.states.set(key, state);

    void this.tick(state, deps);
    const timer = setInterval(() => {
      void this.tick(state, deps);
    }, intervalSeconds * 1000);

    this.timers.set(key, timer);
    return state;
  }

  stop(userId: number, businessId: number): AgentState | null {
    const key = keyFor(userId, businessId);
    const timer = this.timers.get(key);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(key);
    }

    const state = this.states.get(key);
    if (!state) {
      return null;
    }

    state.running = false;
    state.currentAction = null;
    state.nextRunAt = nowIso();
    this.pushLog(state, "info", "Agent stopped");
    return state;
  }

  get(userId: number, businessId: number): AgentState | null {
    return this.states.get(keyFor(userId, businessId)) ?? null;
  }

  async runNow(userId: number, businessId: number, deps: AgentLoopDeps): Promise<AgentState | null> {
    const state = this.get(userId, businessId);
    if (!state || !state.running) {
      return null;
    }

    await this.tick(state, deps);
    return state;
  }
}

export const aiBusinessAgentManager = new AIBusinessAgentManager();
