import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb, getBusinessPlanResult, createBusinessPlanResult, getBusinessById } from "../db";
import { businessPlanResults } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const businessPlanRouter = router({
  /**
   * Get existing business plan for a business
   */
  get: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Verify business ownership
      const business = await getBusinessById(input.businessId);
      if (!business || business.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
      }

      return getBusinessPlanResult(input.businessId);
    }),

  /**
   * Generate business plan and financial model using AI
   */
  generate: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Verify business ownership
      const business = await getBusinessById(input.businessId);
      if (!business || business.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
      }

      // Generate business plan sections using LLM
      const planResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a professional business consultant. Generate comprehensive business plan sections with specific, actionable content.",
          },
          {
            role: "user",
            content: `Create a business plan for: ${business.name}. Service: ${business.serviceType}. Target Market: ${business.targetMarket || "general"}. Location: ${business.location}. Goals: ${business.businessGoals || "growth"}. 
            
            Provide the following sections as JSON:
            {
              "executiveSummary": "2-3 paragraph summary",
              "companyDescription": "detailed company description",
              "marketAnalysis": "market size, trends, opportunities",
              "organizationStructure": "team structure and roles",
              "marketingStrategy": "marketing and sales approach",
              "operationalPlan": "day-to-day operations",
              "fundingRequirements": "startup and operating costs",
              "riskAnalysis": "key risks and mitigation strategies"
            }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "business_plan",
            strict: true,
            schema: {
              type: "object",
              properties: {
                executiveSummary: { type: "string" },
                companyDescription: { type: "string" },
                marketAnalysis: { type: "string" },
                organizationStructure: { type: "string" },
                marketingStrategy: { type: "string" },
                operationalPlan: { type: "string" },
                fundingRequirements: { type: "string" },
                riskAnalysis: { type: "string" },
              },
              required: [
                "executiveSummary",
                "companyDescription",
                "marketAnalysis",
                "organizationStructure",
                "marketingStrategy",
                "operationalPlan",
                "fundingRequirements",
                "riskAnalysis",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const planContent = planResponse.choices[0]?.message?.content;
      let planData: any = {};

      if (typeof planContent === "string") {
        try {
          planData = JSON.parse(planContent);
        } catch (e) {
          console.error("Failed to parse plan JSON:", e);
        }
      }

      // Generate financial projections
      const financialResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a financial analyst. Generate realistic 3-year financial projections for a service business.",
          },
          {
            role: "user",
            content: `Generate 3-year financial projections for: ${business.name}. Service: ${business.serviceType}. Target Market: ${business.targetMarket || "general"}.
            
            Provide as JSON:
            {
              "year1": { "revenue": number, "expenses": number, "profit": number },
              "year2": { "revenue": number, "expenses": number, "profit": number },
              "year3": { "revenue": number, "expenses": number, "profit": number }
            }
            
            Use realistic numbers for a ${business.serviceType} business in ${business.location}.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "financial_projections",
            strict: true,
            schema: {
              type: "object",
              properties: {
                year1: {
                  type: "object",
                  properties: {
                    revenue: { type: "number" },
                    expenses: { type: "number" },
                    profit: { type: "number" },
                  },
                  required: ["revenue", "expenses", "profit"],
                },
                year2: {
                  type: "object",
                  properties: {
                    revenue: { type: "number" },
                    expenses: { type: "number" },
                    profit: { type: "number" },
                  },
                  required: ["revenue", "expenses", "profit"],
                },
                year3: {
                  type: "object",
                  properties: {
                    revenue: { type: "number" },
                    expenses: { type: "number" },
                    profit: { type: "number" },
                  },
                  required: ["revenue", "expenses", "profit"],
                },
              },
              required: ["year1", "year2", "year3"],
              additionalProperties: false,
            },
          },
        },
      });

      const financialContent = financialResponse.choices[0]?.message?.content;
      let financialData: any = {};

      if (typeof financialContent === "string") {
        try {
          financialData = JSON.parse(financialContent);
        } catch (e) {
          console.error("Failed to parse financial JSON:", e);
        }
      }

      // Generate cash flow analysis
      const cashFlowResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a financial analyst. Generate monthly cash flow projections.",
          },
          {
            role: "user",
            content: `Generate 12-month cash flow projections for: ${business.name}. Starting revenue: $${financialData.year1?.revenue || 50000}.
            
            Provide as JSON array of 12 months:
            [
              { "month": "January", "inflow": number, "outflow": number, "balance": number },
              ...
            ]`,
          },
        ],
      });

      const cashFlowContent = cashFlowResponse.choices[0]?.message?.content;
      let cashFlowData: any = {};

      if (typeof cashFlowContent === "string") {
        try {
          const parsed = JSON.parse(cashFlowContent);
          cashFlowData = { monthly: Array.isArray(parsed) ? parsed : [] };
        } catch (e) {
          console.error("Failed to parse cash flow JSON:", e);
          cashFlowData = { monthly: [] };
        }
      }

      // Calculate break-even analysis
      const monthlyExpenses = (financialData.year1?.expenses || 60000) / 12;
      const monthlyRevenue = (financialData.year1?.revenue || 50000) / 12;
      const breakEvenMonths = monthlyExpenses > 0 ? Math.ceil(monthlyExpenses / (monthlyRevenue || 1)) : 6;

      const breakEvenAnalysis = {
        breakEvenPoint: monthlyExpenses,
        monthsToBreakEven: Math.max(1, breakEvenMonths),
      };

      // Save to database
      const existingPlan = await getBusinessPlanResult(input.businessId);

      if (existingPlan) {
        // Update existing
        await db
          .update(businessPlanResults)
          .set({
            executiveSummary: planData.executiveSummary,
            companyDescription: planData.companyDescription,
            marketAnalysis: planData.marketAnalysis,
            organizationStructure: planData.organizationStructure,
            marketingStrategy: planData.marketingStrategy,
            operationalPlan: planData.operationalPlan,
            financialProjections: financialData,
            cashFlowAnalysis: cashFlowData,
            breakEvenAnalysis: breakEvenAnalysis,
            fundingRequirements: planData.fundingRequirements,
            riskAnalysis: planData.riskAnalysis,
            updatedAt: new Date(),
          })
          .where(eq(businessPlanResults.businessId, input.businessId));
      } else {
        // Create new
        await createBusinessPlanResult({
          businessId: input.businessId,
          executiveSummary: planData.executiveSummary,
          companyDescription: planData.companyDescription,
          marketAnalysis: planData.marketAnalysis,
          organizationStructure: planData.organizationStructure,
          marketingStrategy: planData.marketingStrategy,
          operationalPlan: planData.operationalPlan,
          financialProjections: financialData,
          cashFlowAnalysis: cashFlowData,
          breakEvenAnalysis: breakEvenAnalysis,
          fundingRequirements: planData.fundingRequirements,
          riskAnalysis: planData.riskAnalysis,
        });
      }

      return {
        ...planData,
        financialProjections: financialData,
        cashFlowAnalysis: cashFlowData,
        breakEvenAnalysis: breakEvenAnalysis,
      };
    }),
});
