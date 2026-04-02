import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb, getBusinessById, getWebsiteResult } from "../db";

export const deploymentRouter = router({
  /**
   * Generate Vercel deployment configuration
   */
  generateVercelConfig: protectedProcedure
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

      // Get website content
      const website = await getWebsiteResult(input.businessId);
      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website content not generated yet. Please generate website first.",
        });
      }

      // Generate Vercel deployment URL
      const vercelDeployUrl = `https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/static-export&project-name=${business.name
        .toLowerCase()
        .replace(/\s+/g, "-")}&repository-name=${business.name.toLowerCase().replace(/\s+/g, "-")}`;

      return {
        vercelDeployUrl,
        projectName: business.name,
        description: `Deploy ${business.name} website`,
        deploymentInstructions: `
1. Click the "Deploy" button to open Vercel
2. Sign in with your GitHub account
3. Vercel will create a new repository and deploy your site
4. Your website will be live at a unique Vercel URL
5. You can customize the domain in Vercel settings
        `,
      };
    }),

  /**
   * Generate Netlify deployment configuration
   */
  generateNetlifyConfig: protectedProcedure
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

      // Get website content
      const website = await getWebsiteResult(input.businessId);
      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website content not generated yet. Please generate website first.",
        });
      }

      // Generate Netlify deployment URL
      const netlifyDeployUrl = `https://app.netlify.com/start`;

      return {
        netlifyDeployUrl,
        projectName: business.name,
        description: `Deploy ${business.name} website to Netlify`,
        deploymentInstructions: `
1. Click the "Deploy to Netlify" button
2. Sign in with your GitHub account
3. Authorize Netlify to access your repositories
4. Your website will be deployed automatically
5. Get a free Netlify domain or connect your own
6. Automatic deployments on every push to main
        `,
        netlifyToml: `
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
        `,
      };
    }),

  /**
   * Get deployment status and options
   */
  getDeploymentOptions: protectedProcedure
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

      // Get website content
      const website = await getWebsiteResult(input.businessId);

      return {
        hasWebsite: !!website,
        deploymentOptions: [
          {
            name: "Vercel",
            description: "Deploy with Vercel for free. Best for Next.js and React apps.",
            icon: "⚡",
            features: [
              "Free hosting",
              "Automatic deployments",
              "Custom domains",
              "SSL certificates",
              "Analytics",
            ],
            url: website
              ? `https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js&project-name=${business.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`
              : null,
          },
          {
            name: "Netlify",
            description: "Deploy with Netlify. Perfect for static sites and JAMstack.",
            icon: "🚀",
            features: [
              "Free hosting",
              "Git integration",
              "Custom domains",
              "Forms & Functions",
              "Analytics",
            ],
            url: website ? "https://app.netlify.com/start" : null,
          },
          {
            name: "GitHub Pages",
            description: "Deploy directly from GitHub for free.",
            icon: "🐙",
            features: [
              "Free hosting",
              "GitHub integration",
              "Custom domains",
              "HTTPS",
              "Simple setup",
            ],
            url: website ? "https://pages.github.com" : null,
          },
        ],
        nextSteps: website
          ? [
              "Choose a deployment platform above",
              "Connect your GitHub account",
              "Deploy your website",
              "Configure your custom domain",
            ]
          : [
              "First, generate your website using the Website Generator",
              "Then come back to deploy it",
            ],
      };
    }),
});
