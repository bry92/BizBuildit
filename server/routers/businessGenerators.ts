import {
  createBrandingResult,
  createLeadResult,
  createPricingResult,
  createWebsiteResult,
  getBrandingResult,
  getBusinessById,
} from "../db";
import { invokeLLM } from "../_core/llm";

export async function generateBrandingForBusiness(businessId: number) {
  const business = await getBusinessById(businessId);
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

  await createBrandingResult({
    businessId,
    businessName: brandingData.businessName,
    tagline: brandingData.tagline,
    brandVoice: brandingData.brandVoice,
    colorPalette: brandingData.colorPalette,
    logoDescription: brandingData.logoDescription,
  });

  return brandingData;
}

export async function generateWebsiteForBusiness(businessId: number) {
  const business = await getBusinessById(businessId);
  if (!business) throw new Error("Business not found");

  const branding = await getBrandingResult(businessId);

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

  await createWebsiteResult({
    businessId,
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

  return websiteData;
}

export async function generatePricingForBusiness(businessId: number) {
  const business = await getBusinessById(businessId);
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

  await createPricingResult({
    businessId,
    marketBenchmark: pricingData.marketBenchmark,
    recommendedTiers: pricingData.recommendedTiers,
    competitorAnalysis: pricingData.competitorAnalysis,
    pricingStrategy: pricingData.pricingStrategy,
  });

  return pricingData;
}

export async function generateLeadsForBusiness(businessId: number) {
  const business = await getBusinessById(businessId);
  if (!business) throw new Error("Business not found");

  const branding = await getBrandingResult(businessId);

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

  await createLeadResult({
    businessId,
    facebookAdCopy: leadData.facebookAdCopy,
    googleAdCopy: leadData.googleAdCopy,
    linkedinAdCopy: leadData.linkedinAdCopy,
    emailSequence: leadData.emailSequence,
    smsScript: leadData.smsScript,
    leadMagnetIdeas: leadData.leadMagnetIdeas,
  });

  return leadData;
}
