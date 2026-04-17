import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createBusiness,
  getUserBusinesses,
  getBusinessById,
  updateBusiness,
  getBrandingResult,
  getWebsiteResult,
  getPricingResult,
  getLeadResult,
  getShowcaseBusinesses,
} from "../db";
import {
  generateBrandingForBusiness,
  generateLeadsForBusiness,
  generatePricingForBusiness,
  generateWebsiteForBusiness,
} from "./businessGenerators";

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
      return generateBrandingForBusiness(input.businessId);
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
      return generateWebsiteForBusiness(input.businessId);
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
      return generatePricingForBusiness(input.businessId);
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
      return generateLeadsForBusiness(input.businessId);
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
