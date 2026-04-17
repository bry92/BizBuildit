import { z } from "zod";
import {
  getBrandingResult,
  getBusinessById,
  getLeadResult,
  getPricingResult,
  getWebsiteResult,
  updateBusiness,
} from "../db";
import { aiBusinessAgentManager } from "../_core/aiBusinessAgent";
import { protectedProcedure, router } from "../_core/trpc";
import {
  generateBrandingForBusiness,
  generateLeadsForBusiness,
  generatePricingForBusiness,
  generateWebsiteForBusiness,
} from "./businessGenerators";
import { invokeLLM } from "../_core/llm";

async function executeAutonomousStep(userId: number, businessId: number, cycleCount: number) {
  const business = await getBusinessById(businessId);
  if (!business || business.userId !== userId) {
    throw new Error("Business not found");
  }

  if (business.status === "draft") {
    await updateBusiness(businessId, { status: "generated" });
    return {
      action: "initialize",
      detail: "Business moved from draft to generated so automation can begin",
    };
  }

  const branding = await getBrandingResult(businessId);
  if (!branding) {
    await generateBrandingForBusiness(businessId);
    return { action: "branding", detail: "Generated brand identity assets" };
  }

  const website = await getWebsiteResult(businessId);
  if (!website) {
    await generateWebsiteForBusiness(businessId);
    return { action: "website", detail: "Generated conversion-focused website content" };
  }

  const pricing = await getPricingResult(businessId);
  if (!pricing) {
    await generatePricingForBusiness(businessId);
    return { action: "pricing", detail: "Generated tiered pricing and strategy" };
  }

  const leads = await getLeadResult(businessId);
  if (!leads) {
    await generateLeadsForBusiness(businessId);
    return { action: "lead-gen", detail: "Generated outbound lead templates" };
  }

  const performanceReview = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an operations copilot for a small business. Respond with one concise optimization action.",
      },
      {
        role: "user",
        content: `Cycle ${cycleCount}: business=${business.name}; service=${business.serviceType}; location=${business.location}. Suggest one next best daily growth action with a measurable KPI.`,
      },
    ],
  });

  const content = performanceReview.choices[0]?.message.content;
  const detail =
    typeof content === "string"
      ? content.slice(0, 240)
      : "Reviewed current assets and prepared next optimization action";

  return {
    action: "optimize",
    detail,
    completed: true,
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
      const business = await getBusinessById(input.businessId);
      if (!business || business.userId !== ctx.user.id) {
        throw new Error("Business not found");
      }

      const state = aiBusinessAgentManager.start(
        ctx.user.id,
        input.businessId,
        input.intervalSeconds,
        async ({ userId, businessId, cycleCount }) =>
          executeAutonomousStep(userId, businessId, cycleCount)
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
    const state = await aiBusinessAgentManager.runNow(
      ctx.user.id,
      input.businessId,
      async ({ userId, businessId, cycleCount }) =>
        executeAutonomousStep(userId, businessId, cycleCount)
    );

    return {
      success: !!state,
      state,
    } as const;
  }),
});
