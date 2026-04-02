import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb, getBusinessById } from "../db";
import { invokeLLM } from "../_core/llm";

export const marketIntelligenceRouter = router({
  /**
   * Generate market intelligence and competitor analysis
   */
  analyze: protectedProcedure
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

      // Generate market research
      const marketResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a market research analyst. Provide detailed market analysis with specific data and insights.",
          },
          {
            role: "user",
            content: `Analyze the market for: ${business.name}. Service: ${business.serviceType}. Target Market: ${business.targetMarket || "general"}. Location: ${business.location}.
            
            Provide as JSON:
            {
              "marketSize": "estimated market size in dollars",
              "marketGrowth": "annual growth rate percentage",
              "marketTrends": "current trends and opportunities",
              "targetDemographics": "detailed target customer profile",
              "marketSaturation": "saturation level (low/medium/high)",
              "opportunities": "specific market opportunities",
              "challenges": "market challenges and barriers"
            }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "market_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                marketSize: { type: "string" },
                marketGrowth: { type: "string" },
                marketTrends: { type: "string" },
                targetDemographics: { type: "string" },
                marketSaturation: { type: "string" },
                opportunities: { type: "string" },
                challenges: { type: "string" },
              },
              required: [
                "marketSize",
                "marketGrowth",
                "marketTrends",
                "targetDemographics",
                "marketSaturation",
                "opportunities",
                "challenges",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const marketContent = marketResponse.choices[0]?.message?.content;
      let marketData: any = {};

      if (typeof marketContent === "string") {
        try {
          marketData = JSON.parse(marketContent);
        } catch (e) {
          console.error("Failed to parse market JSON:", e);
        }
      }

      // Generate competitor analysis
      const competitorResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a competitive analyst. Identify and analyze direct and indirect competitors.",
          },
          {
            role: "user",
            content: `Identify competitors for: ${business.name}. Service: ${business.serviceType}. Location: ${business.location}.
            
            Provide as JSON:
            {
              "directCompetitors": [
                { "name": "competitor name", "strength": "key strengths", "weakness": "key weaknesses", "pricing": "pricing strategy" }
              ],
              "indirectCompetitors": [
                { "name": "competitor name", "threat": "how they compete" }
              ],
              "competitiveAdvantage": "our competitive advantage",
              "marketPosition": "recommended market position"
            }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "competitor_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                directCompetitors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      strength: { type: "string" },
                      weakness: { type: "string" },
                      pricing: { type: "string" },
                    },
                  },
                },
                indirectCompetitors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      threat: { type: "string" },
                    },
                  },
                },
                competitiveAdvantage: { type: "string" },
                marketPosition: { type: "string" },
              },
              required: [
                "directCompetitors",
                "indirectCompetitors",
                "competitiveAdvantage",
                "marketPosition",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const competitorContent = competitorResponse.choices[0]?.message?.content;
      let competitorData: any = {};

      if (typeof competitorContent === "string") {
        try {
          competitorData = JSON.parse(competitorContent);
        } catch (e) {
          console.error("Failed to parse competitor JSON:", e);
        }
      }

      // Generate market gaps and opportunities
      const gapsResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a business strategist. Identify market gaps and untapped opportunities.",
          },
          {
            role: "user",
            content: `For ${business.name} in the ${business.serviceType} industry targeting ${business.targetMarket}, identify:
            
            Provide as JSON:
            {
              "marketGaps": "unmet customer needs and gaps",
              "untappedSegments": "customer segments not well served",
              "innovationOpportunities": "ways to innovate and differentiate",
              "partnershipOpportunities": "potential partnerships and collaborations",
              "recommendedStrategy": "recommended go-to-market strategy"
            }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "market_gaps",
            strict: true,
            schema: {
              type: "object",
              properties: {
                marketGaps: { type: "string" },
                untappedSegments: { type: "string" },
                innovationOpportunities: { type: "string" },
                partnershipOpportunities: { type: "string" },
                recommendedStrategy: { type: "string" },
              },
              required: [
                "marketGaps",
                "untappedSegments",
                "innovationOpportunities",
                "partnershipOpportunities",
                "recommendedStrategy",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const gapsContent = gapsResponse.choices[0]?.message?.content;
      let gapsData: any = {};

      if (typeof gapsContent === "string") {
        try {
          gapsData = JSON.parse(gapsContent);
        } catch (e) {
          console.error("Failed to parse gaps JSON:", e);
        }
      }

      return {
        marketAnalysis: marketData,
        competitorAnalysis: competitorData,
        marketGaps: gapsData,
      };
    }),
});
