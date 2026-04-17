import { invokeLLM } from "./llm";

export type BrainActionType =
  | "optimize_pricing"
  | "generate_landing_page"
  | "create_lead_magnet"
  | "fix_funnel"
  | "run_marketing_test"
  | "analyze_metrics";

export type BrainInput = {
  businessId: string;
  metrics: {
    traffic: number;
    conversions: number;
    revenue: number;
    churn?: number;
  };
  recentActions: string[];
  memory: Array<Record<string, unknown>>;
  systemHealth: {
    errors: number;
    uptime: number;
  };
};

export type BrainDecision = {
  priority: "low" | "medium" | "high" | "critical";
  actions: Array<{
    type: BrainActionType;
    reason: string;
    payload?: Record<string, unknown>;
  }>;
};

const FALLBACK_DECISION: BrainDecision = {
  priority: "medium",
  actions: [
    {
      type: "analyze_metrics",
      reason: "Fallback decision used because model output was unavailable or invalid.",
    },
  ],
};

export async function generateNextActions(input: BrainInput): Promise<BrainDecision> {
  const prompt = `
You are an autonomous business operator.

You manage a live business system that must improve revenue and performance continuously.

Current state:
- Traffic: ${input.metrics.traffic}
- Conversions: ${input.metrics.conversions}
- Revenue: ${input.metrics.revenue}
- Churn: ${input.metrics.churn ?? "unknown"}

Recent actions:
${input.recentActions.join("\n") || "none"}

System health:
- Errors: ${input.systemHealth.errors}
- Uptime: ${input.systemHealth.uptime}

Memory:
${JSON.stringify(input.memory.slice(-10), null, 2)}

Your job:
Decide the next actions that will most likely increase business performance.

Rules:
- Prefer revenue-impacting actions
- Avoid repeating recent actions unless necessary
- Always include reasoning
- Limit to 1–3 actions per cycle
- Use only these action types: optimize_pricing, generate_landing_page, create_lead_magnet, fix_funnel, run_marketing_test, analyze_metrics
Return JSON only.
`;

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an autonomous business brain. Respond with strict JSON only and no markdown.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "brain_decision",
        strict: true,
        schema: {
          type: "object",
          properties: {
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
            actions: {
              type: "array",
              minItems: 1,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "optimize_pricing",
                      "generate_landing_page",
                      "create_lead_magnet",
                      "fix_funnel",
                      "run_marketing_test",
                      "analyze_metrics",
                    ],
                  },
                  reason: { type: "string" },
                  payload: { type: "object", additionalProperties: true },
                },
                required: ["type", "reason"],
                additionalProperties: false,
              },
            },
          },
          required: ["priority", "actions"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = result.choices[0]?.message.content;
  const asString = typeof content === "string" ? content : JSON.stringify(content ?? {});

  try {
    const parsed = JSON.parse(asString) as BrainDecision;
    if (!parsed.actions?.length) {
      return FALLBACK_DECISION;
    }
    return parsed;
  } catch {
    return FALLBACK_DECISION;
  }
}
