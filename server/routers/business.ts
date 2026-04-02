import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createBusiness,
  getUserBusinesses,
  getBusinessById,
  updateBusiness,
  createBrandingResult,
  getBrandingResult,
  createWebsiteResult,
  getWebsiteResult,
  createPricingResult,
  getPricingResult,
  createLeadResult,
  getLeadResult,
  getShowcaseBusinesses,
} from "../db";
import { invokeLLM } from "../_core/llm";

export const businessRouter = router({
  // Create a new business concept
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        serviceType: z.string().min(1),
        targetMarket: z.string().optional(),
        location: z.string().min(1),
        businessGoals: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createBusiness(ctx.user.id, {
        name: input.name,
        serviceType: input.serviceType,
        targetMarket: input.targetMarket || null,
        location: input.location,
        businessGoals: input.businessGoals || null,
        status: "draft",
      });
      return result;
    }),

  // Get all businesses for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserBusinesses(ctx.user.id);
  }),

  // Get a specific business
  get: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return getBusinessById(input.businessId);
    }),

  // Update business
  update: protectedProcedure
    .input(
      z.object({
        businessId: z.number(),
        data: z.object({
          name: z.string().optional(),
          serviceType: z.string().optional(),
          targetMarket: z.string().optional(),
          location: z.string().optional(),
          businessGoals: z.string().optional(),
          status: z.enum(["draft", "generated", "published"]).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return updateBusiness(input.businessId, input.data);
    }),

  // Generate branding for a business
  generateBranding: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const business = await getBusinessById(input.businessId);
      if (!business) throw new Error("Business not found");

      const prompt = `Generate branding for a ${business.serviceType} business in ${business.location}. 
Target market: ${business.targetMarket || "general"}
Business goals: ${business.businessGoals || "standard service business"}

Provide a JSON response with:
{
  "businessName": "creative business name",
  "tagline": "catchy tagline",
  "brandVoice": "description of brand voice and tone",
  "colorPalette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "background": "#HEX",
    "text": "#HEX"
  },
  "logoDescription": "description of logo concept"
}`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a branding expert. Generate creative and professional branding for service businesses.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "branding_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                businessName: { type: "string" },
                tagline: { type: "string" },
                brandVoice: { type: "string" },
                colorPalette: {
                  type: "object",
                  properties: {
                    primary: { type: "string" },
                    secondary: { type: "string" },
                    accent: { type: "string" },
                    background: { type: "string" },
                    text: { type: "string" },
                  },
                  required: ["primary", "secondary", "accent", "background", "text"],
                },
                logoDescription: { type: "string" },
              },
              required: [
                "businessName",
                "tagline",
                "brandVoice",
                "colorPalette",
                "logoDescription",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content) throw new Error("No response from LLM");

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const brandingData = JSON.parse(contentStr);

      return createBrandingResult({
        businessId: input.businessId,
        businessName: brandingData.businessName,
        tagline: brandingData.tagline,
        brandVoice: brandingData.brandVoice,
        colorPalette: brandingData.colorPalette,
        logoDescription: brandingData.logoDescription,
      });
    }),

  // Get branding for a business
  getBranding: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return getBrandingResult(input.businessId);
    }),

  // Generate website for a business
  generateWebsite: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const business = await getBusinessById(input.businessId);
      if (!business) throw new Error("Business not found");

      const branding = await getBrandingResult(input.businessId);

      const prompt = `Generate a landing page for a ${business.serviceType} business called "${branding?.businessName || business.name}" in ${business.location}.
${branding ? `Tagline: ${branding.tagline}` : ""}

Provide a JSON response with:
{
  "heroTitle": "main headline",
  "heroSubtitle": "subheading",
  "heroDescription": "hero section description",
  "featuresSectionCopy": "description of services/features",
  "ctaText": "call to action button text",
  "seoTitle": "SEO title tag",
  "seoDescription": "SEO meta description",
  "seoKeywords": "comma-separated keywords",
  "htmlStructure": "basic HTML structure for landing page"
}`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a web copywriter and SEO expert. Generate compelling landing page content.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "website_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                heroTitle: { type: "string" },
                heroSubtitle: { type: "string" },
                heroDescription: { type: "string" },
                featuresSectionCopy: { type: "string" },
                ctaText: { type: "string" },
                seoTitle: { type: "string" },
                seoDescription: { type: "string" },
                seoKeywords: { type: "string" },
                htmlStructure: { type: "string" },
              },
              required: [
                "heroTitle",
                "heroSubtitle",
                "heroDescription",
                "featuresSectionCopy",
                "ctaText",
                "seoTitle",
                "seoDescription",
                "seoKeywords",
                "htmlStructure",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content) throw new Error("No response from LLM");

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const websiteData = JSON.parse(contentStr);

      return createWebsiteResult({
        businessId: input.businessId,
        heroTitle: websiteData.heroTitle,
        heroSubtitle: websiteData.heroSubtitle,
        heroDescription: websiteData.heroDescription,
        featuresSectionCopy: websiteData.featuresSectionCopy,
        ctaText: websiteData.ctaText,
        seoTitle: websiteData.seoTitle,
        seoDescription: websiteData.seoDescription,
        seoKeywords: websiteData.seoKeywords,
        htmlStructure: websiteData.htmlStructure,
      });
    }),

  // Get website for a business
  getWebsite: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return getWebsiteResult(input.businessId);
    }),

  // Generate pricing for a business
  generatePricing: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const business = await getBusinessById(input.businessId);
      if (!business) throw new Error("Business not found");

      const prompt = `Generate pricing strategy for a ${business.serviceType} business in ${business.location}.
Target market: ${business.targetMarket || "general"}

Provide a JSON response with:
{
  "marketBenchmark": {
    "low": number,
    "average": number,
    "high": number
  },
  "recommendedTiers": [
    {
      "name": "tier name",
      "price": number,
      "description": "what's included"
    }
  ],
  "competitorAnalysis": "brief analysis of local competitors",
  "pricingStrategy": "recommended pricing strategy"
}`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a pricing strategist. Generate realistic pricing recommendations based on market data.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "pricing_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                marketBenchmark: {
                  type: "object",
                  properties: {
                    low: { type: "number" },
                    average: { type: "number" },
                    high: { type: "number" },
                  },
                  required: ["low", "average", "high"],
                },
                recommendedTiers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      price: { type: "number" },
                      description: { type: "string" },
                    },
                    required: ["name", "price", "description"],
                  },
                },
                competitorAnalysis: { type: "string" },
                pricingStrategy: { type: "string" },
              },
              required: [
                "marketBenchmark",
                "recommendedTiers",
                "competitorAnalysis",
                "pricingStrategy",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content) throw new Error("No response from LLM");

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const pricingData = JSON.parse(contentStr);

      return createPricingResult({
        businessId: input.businessId,
        marketBenchmark: pricingData.marketBenchmark,
        recommendedTiers: pricingData.recommendedTiers,
        competitorAnalysis: pricingData.competitorAnalysis,
        pricingStrategy: pricingData.pricingStrategy,
      });
    }),

  // Get pricing for a business
  getPricing: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return getPricingResult(input.businessId);
    }),

  // Generate leads for a business
  generateLeads: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const business = await getBusinessById(input.businessId);
      if (!business) throw new Error("Business not found");

      const branding = await getBrandingResult(input.businessId);

      const prompt = `Generate lead generation templates for a ${business.serviceType} business called "${branding?.businessName || business.name}" in ${business.location}.

Provide a JSON response with:
{
  "facebookAdCopy": "compelling Facebook ad copy",
  "googleAdCopy": "compelling Google Ads copy",
  "linkedinAdCopy": "compelling LinkedIn ad copy",
  "emailSequence": [
    {
      "subject": "email subject line",
      "body": "email body content"
    }
  ],
  "smsScript": "SMS template for outreach",
  "leadMagnetIdeas": "ideas for lead magnets"
}`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a marketing expert. Generate high-converting ad copy and lead generation templates.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lead_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                facebookAdCopy: { type: "string" },
                googleAdCopy: { type: "string" },
                linkedinAdCopy: { type: "string" },
                emailSequence: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      subject: { type: "string" },
                      body: { type: "string" },
                    },
                    required: ["subject", "body"],
                  },
                },
                smsScript: { type: "string" },
                leadMagnetIdeas: { type: "string" },
              },
              required: [
                "facebookAdCopy",
                "googleAdCopy",
                "linkedinAdCopy",
                "emailSequence",
                "smsScript",
                "leadMagnetIdeas",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content) throw new Error("No response from LLM");

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const leadData = JSON.parse(contentStr);

      return createLeadResult({
        businessId: input.businessId,
        facebookAdCopy: leadData.facebookAdCopy,
        googleAdCopy: leadData.googleAdCopy,
        linkedinAdCopy: leadData.linkedinAdCopy,
        emailSequence: leadData.emailSequence,
        smsScript: leadData.smsScript,
        leadMagnetIdeas: leadData.leadMagnetIdeas,
      });
    }),

  // Get leads for a business
  getLeads: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return getLeadResult(input.businessId);
    }),

  // Get showcase businesses
  getShowcase: protectedProcedure.query(async () => {
    return getShowcaseBusinesses(6);
  }),
});
