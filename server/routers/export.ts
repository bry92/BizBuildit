import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { businesses, brandingResults, websiteResults, pricingResults, leadResults } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateBusinessHTML, generateBusinessCSV, generateBusinessReport } from "../export";

export const exportRouter = router({
  /**
   * Export business package as HTML
   */
  exportHTML: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Get business
      const business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.businessId))
        .limit(1);

      if (!business.length || business[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
      }

      // Get all related data
      const branding = await db
        .select()
        .from(brandingResults)
        .where(eq(brandingResults.businessId, input.businessId))
        .limit(1);

      const website = await db
        .select()
        .from(websiteResults)
        .where(eq(websiteResults.businessId, input.businessId))
        .limit(1);

      const pricing = await db
        .select()
        .from(pricingResults)
        .where(eq(pricingResults.businessId, input.businessId))
        .limit(1);

      const leads = await db
        .select()
        .from(leadResults)
        .where(eq(leadResults.businessId, input.businessId))
        .limit(1);

      const pkg = {
        business: business[0],
        branding: branding[0] || null,
        website: website[0] || null,
        pricing: pricing[0] || null,
        leads: leads[0] || null,
      };

      const html = generateBusinessHTML(pkg);
      const filename = `${business[0].name.replace(/\s+/g, "-").toLowerCase()}-package.html`;

      return {
        html,
        filename,
        mimeType: "text/html",
      };
    }),

  /**
   * Export business package as CSV
   */
  exportCSV: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Get business
      const business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.businessId))
        .limit(1);

      if (!business.length || business[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
      }

      // Get all related data
      const branding = await db
        .select()
        .from(brandingResults)
        .where(eq(brandingResults.businessId, input.businessId))
        .limit(1);

      const website = await db
        .select()
        .from(websiteResults)
        .where(eq(websiteResults.businessId, input.businessId))
        .limit(1);

      const pricing = await db
        .select()
        .from(pricingResults)
        .where(eq(pricingResults.businessId, input.businessId))
        .limit(1);

      const leads = await db
        .select()
        .from(leadResults)
        .where(eq(leadResults.businessId, input.businessId))
        .limit(1);

      const pkg = {
        business: business[0],
        branding: branding[0] || null,
        website: website[0] || null,
        pricing: pricing[0] || null,
        leads: leads[0] || null,
      };

      const csv = generateBusinessCSV(pkg);
      const filename = `${business[0].name.replace(/\s+/g, "-").toLowerCase()}-data.csv`;

      return {
        csv,
        filename,
        mimeType: "text/csv",
      };
    }),

  /**
   * Export business package as text report
   */
  exportReport: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Get business
      const business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.businessId))
        .limit(1);

      if (!business.length || business[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
      }

      // Get all related data
      const branding = await db
        .select()
        .from(brandingResults)
        .where(eq(brandingResults.businessId, input.businessId))
        .limit(1);

      const website = await db
        .select()
        .from(websiteResults)
        .where(eq(websiteResults.businessId, input.businessId))
        .limit(1);

      const pricing = await db
        .select()
        .from(pricingResults)
        .where(eq(pricingResults.businessId, input.businessId))
        .limit(1);

      const leads = await db
        .select()
        .from(leadResults)
        .where(eq(leadResults.businessId, input.businessId))
        .limit(1);

      const pkg = {
        business: business[0],
        branding: branding[0] || null,
        website: website[0] || null,
        pricing: pricing[0] || null,
        leads: leads[0] || null,
      };

      const report = generateBusinessReport(pkg);
      const filename = `${business[0].name.replace(/\s+/g, "-").toLowerCase()}-report.txt`;

      return {
        report,
        filename,
        mimeType: "text/plain",
      };
    }),
});
