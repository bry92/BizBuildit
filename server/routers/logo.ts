import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb, getLogoResult, createLogoResult, getBusinessById, getBrandingResult } from "../db";
import { logoResults } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";

export const logoRouter = router({
  /**
   * Get existing logo results for a business
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

      return getLogoResult(input.businessId);
    }),

  /**
   * Generate logos and visual assets using AI
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

      // Get branding info for context
      const branding = await getBrandingResult(input.businessId);

      // Generate logo prompt using LLM
      const logoPromptResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a professional logo designer. Create a detailed, specific prompt for an AI image generator to create a professional logo.",
          },
          {
            role: "user",
            content: `Create a logo design prompt for: ${business.name}. Service: ${business.serviceType}. Brand voice: ${branding?.brandVoice || "professional"}. Keep the prompt under 100 words and be specific about style, colors, and elements.`,
          },
        ],
      });

      const logoPromptContent = logoPromptResponse.choices[0]?.message?.content;
      const logoPrompt =
        typeof logoPromptContent === "string"
          ? logoPromptContent
          : `Professional logo for ${business.name}, a ${business.serviceType} business`;

      // Generate logo image
      const logoImage = await generateImage({
        prompt: logoPrompt,
      });

      // Generate social media banners
      const facebookBannerImage = await generateImage({
        prompt: `Facebook banner (1200x628px) for ${business.name}. Professional, modern design. Include business name and tagline.`,
      });

      const instagramBannerImage = await generateImage({
        prompt: `Instagram profile banner (1080x1080px) for ${business.name}. Square format, professional, modern.`,
      });

      const linkedinBannerImage = await generateImage({
        prompt: `LinkedIn banner (1500x500px) for ${business.name}. Professional business design.`,
      });

      const businessCardImage = await generateImage({
        prompt: `Business card design (3.5x2 inches) for ${business.name}. Professional, clean layout with contact information placeholder.`,
      });

      const faviconImage = await generateImage({
        prompt: `Favicon (256x256px) for ${business.name}. Simple, recognizable icon, professional.`,
      });

      const appIconImage = await generateImage({
        prompt: `App icon (512x512px) for ${business.name}. Modern, professional, suitable for mobile app.`,
      });

      // Save to database
      const existingLogo = await getLogoResult(input.businessId);

      if (existingLogo) {
        // Update existing
        await db
          .update(logoResults)
          .set({
            logoImageUrl: logoImage.url,
            logoPrompt: logoPrompt || undefined,
            facebookBannerUrl: facebookBannerImage.url,
            instagramBannerUrl: instagramBannerImage.url,
            linkedinBannerUrl: linkedinBannerImage.url,
            businessCardUrl: businessCardImage.url,
            faviconUrl: faviconImage.url,
            appIconUrl: appIconImage.url,
            updatedAt: new Date(),
          })
          .where(eq(logoResults.businessId, input.businessId));
      } else {
        // Create new
        await createLogoResult({
          businessId: input.businessId,
          logoImageUrl: logoImage.url,
          logoPrompt: logoPrompt || undefined,
          facebookBannerUrl: facebookBannerImage.url,
          instagramBannerUrl: instagramBannerImage.url,
          linkedinBannerUrl: linkedinBannerImage.url,
          businessCardUrl: businessCardImage.url,
          faviconUrl: faviconImage.url,
          appIconUrl: appIconImage.url,
        });
      }

      return {
        logoImageUrl: logoImage.url,
        facebookBannerUrl: facebookBannerImage.url,
        instagramBannerUrl: instagramBannerImage.url,
        linkedinBannerUrl: linkedinBannerImage.url,
        businessCardUrl: businessCardImage.url,
        faviconUrl: faviconImage.url,
        appIconUrl: appIconImage.url,
        logoPrompt,
      };
    }),
});
