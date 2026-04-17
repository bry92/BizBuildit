export type AgentStepResult = {
  action: string;
  detail: string;
  completed?: boolean;
};

export type AgentExecutionContext = {
  userId: number;
  businessId: number;
  cycleCount: number;
};

export type AgentExecutor = (ctx: AgentExecutionContext) => Promise<AgentStepResult>;

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
  logs: Array<{
    at: string;
    level: "info" | "error";
    message: string;
  }>;
};

const MAX_LOGS = 100;

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

  private async runCycle(state: AgentState, execute: AgentExecutor): Promise<void> {
    if (!state.running || state.currentAction) {
      return;
    }

    state.currentAction = "evaluating";
    state.lastRunAt = nowIso();

    try {
      const result = await execute({
        userId: state.userId,
        businessId: state.businessId,
        cycleCount: state.cycleCount,
      });
      state.cycleCount += 1;
      state.currentAction = result.action;
      state.nextRunAt = new Date(Date.now() + state.intervalSeconds * 1000).toISOString();
      state.lastError = null;
      this.pushLog(
        state,
        "info",
        `${result.action}: ${result.detail}${result.completed ? " (completed)" : ""}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      state.lastError = message;
      state.nextRunAt = new Date(Date.now() + state.intervalSeconds * 1000).toISOString();
      this.pushLog(state, "error", message);
    } finally {
      state.currentAction = null;
    }
  }

  start(userId: number, businessId: number, intervalSeconds: number, execute: AgentExecutor): AgentState {
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
      logs: [],
    };
    this.pushLog(state, "info", `Agent started with ${intervalSeconds}s cadence`);
    this.states.set(key, state);

    void this.runCycle(state, execute);
    const timer = setInterval(() => {
      void this.runCycle(state, execute);
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

  async runNow(userId: number, businessId: number, execute: AgentExecutor): Promise<AgentState | null> {
    const state = this.get(userId, businessId);
    if (!state || !state.running) {
      return null;
    }

    await this.runCycle(state, execute);
    return state;
  }
}

export const aiBusinessAgentManager = new AIBusinessAgentManager();
