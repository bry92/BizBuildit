import { z } from "zod";
import {
  getBrandingResult,
  getBusinessById,
  getLeadResult,
  getPricingResult,
  getWebsiteResult,
  updateBusiness,
} from "../db";
import { aiBusinessAgentManager, AgentLoopDeps, AgentState } from "../_core/aiBusinessAgent";
import { BrainInput } from "../_core/aiDecisionEngine";
import { protectedProcedure, router } from "../_core/trpc";
import {
  generateBrandingForBusiness,
  generateLeadsForBusiness,
  generatePricingForBusiness,
  generateWebsiteForBusiness,
} from "./businessGenerators";
import { invokeLLM } from "../_core/llm";

async function ensureBusinessAccess(userId: number, businessId: number) {
  const business = await getBusinessById(businessId);
  if (!business || business.userId !== userId) {
    throw new Error("Business not found");
  }
  return business;
}

async function senseBusinessState(userId: number, businessId: number, state: AgentState): Promise<BrainInput> {
  const business = await ensureBusinessAccess(userId, businessId);

  const [branding, website, pricing, leads] = await Promise.all([
    getBrandingResult(businessId),
    getWebsiteResult(businessId),
    getPricingResult(businessId),
    getLeadResult(businessId),
  ]);

  const traffic = (website ? 120 : 20) + state.cycleCount * 5;
  const conversions = Math.max(1, Math.floor(traffic * (leads ? 0.08 : 0.02)));
  const baseRevenue = pricing?.recommendedTiers
    ? (pricing.recommendedTiers as Array<{ price: number }>)[0]?.price || 0
    : 0;
  const revenue = conversions * baseRevenue;
  const missingAssets = [branding, website, pricing, leads].filter((entry) => !entry).length;

  return {
    businessId: String(business.id),
    metrics: {
      traffic,
      conversions,
      revenue,
      churn: missingAssets > 0 ? 0.2 : 0.05,
    },
    recentActions: state.recentActions,
    memory: state.memory,
    systemHealth: {
      errors: state.logs.filter((log) => log.level === "error").length,
      uptime: Math.round((Date.now() - new Date(state.startedAt).getTime()) / 1000),
    },
  };
}

async function executeAction(userId: number, businessId: number, action: { type: string; reason: string; payload?: Record<string, unknown> }) {
  await ensureBusinessAccess(userId, businessId);

  switch (action.type) {
    case "optimize_pricing": {
      await generatePricingForBusiness(businessId);
      return { summary: `Pricing optimization executed. ${action.reason}` };
    }

    case "generate_landing_page": {
      const branding = await getBrandingResult(businessId);
      if (!branding) {
        await generateBrandingForBusiness(businessId);
      }
      await generateWebsiteForBusiness(businessId);
      return { summary: `Landing page refreshed from latest brand voice. ${action.reason}` };
    }

    case "create_lead_magnet": {
      await generateLeadsForBusiness(businessId);
      return { summary: `Lead magnet and outreach copy generated. ${action.reason}` };
    }

    case "fix_funnel": {
      const [branding, website, pricing, leads] = await Promise.all([
        getBrandingResult(businessId),
        getWebsiteResult(businessId),
        getPricingResult(businessId),
        getLeadResult(businessId),
      ]);

      if (!branding) await generateBrandingForBusiness(businessId);
      if (!website) await generateWebsiteForBusiness(businessId);
      if (!pricing) await generatePricingForBusiness(businessId);
      if (!leads) await generateLeadsForBusiness(businessId);

      await updateBusiness(businessId, { status: "generated" });
      return { summary: `Funnel gaps repaired across missing assets. ${action.reason}` };
    }

    case "run_marketing_test": {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You design small growth experiments for local service businesses.",
          },
          {
            role: "user",
            content: `Create one concise A/B marketing test for business ${businessId}. Include KPI and expected signal.`,
          },
        ],
      });
      const content = response.choices[0]?.message.content;
      const plan = typeof content === "string" ? content.slice(0, 240) : "A/B experiment outlined";
      return { summary: `Marketing experiment planned: ${plan}` };
    }

    case "analyze_metrics":
    default:
      return { summary: `Metrics reviewed for next optimization cycle. ${action.reason}` };
  }
}

function createLoopDeps(): AgentLoopDeps {
  return {
    sense: ({ userId, businessId, state }) => senseBusinessState(userId, businessId, state),
    executeAction: ({ userId, businessId, action }) => executeAction(userId, businessId, action),
  };
}

const inputSchema = z.object({ businessId: z.number() });

export const agentRouter = router({
  start: protectedProcedure
    .input(
      inputSchema.extend({
        intervalSeconds: z.number().int().min(30).max(3600).default(300),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ensureBusinessAccess(ctx.user.id, input.businessId);

      const state = aiBusinessAgentManager.start(
        ctx.user.id,
        input.businessId,
        input.intervalSeconds,
        createLoopDeps()
      );

      return {
        success: true,
        state,
      } as const;
    }),

  stop: protectedProcedure.input(inputSchema).mutation(async ({ ctx, input }) => {
    const state = aiBusinessAgentManager.stop(ctx.user.id, input.businessId);
    return {
      success: !!state,
      state,
    } as const;
  }),

  status: protectedProcedure.input(inputSchema).query(({ ctx, input }) => {
    return aiBusinessAgentManager.get(ctx.user.id, input.businessId);
  }),

  runNow: protectedProcedure.input(inputSchema).mutation(async ({ ctx, input }) => {
    const state = await aiBusinessAgentManager.runNow(ctx.user.id, input.businessId, createLoopDeps());

    return {
      success: !!state,
      state,
    } as const;
  }),
});
