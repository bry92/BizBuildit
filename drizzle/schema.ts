import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Business projects created by users
 * Stores the core business concept and metadata
 */
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: varchar("serviceType", { length: 255 }).notNull(),
  targetMarket: text("targetMarket"),
  location: varchar("location", { length: 255 }).notNull(),
  businessGoals: text("businessGoals"),
  status: mysqlEnum("status", ["draft", "generated", "published"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

/**
 * Branding results for each business
 * Stores AI-generated branding assets and guidelines
 */
export const brandingResults = mysqlTable("brandingResults", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  tagline: text("tagline"),
  brandVoice: text("brandVoice"),
  colorPalette: json("colorPalette"), // { primary, secondary, accent, background, text }
  logoDescription: text("logoDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrandingResult = typeof brandingResults.$inferSelect;
export type InsertBrandingResult = typeof brandingResults.$inferInsert;

/**
 * Website generation results
 * Stores HTML structure, copy, and SEO metadata
 */
export const websiteResults = mysqlTable("websiteResults", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  heroTitle: text("heroTitle"),
  heroSubtitle: text("heroSubtitle"),
  heroDescription: text("heroDescription"),
  featuresSectionCopy: text("featuresSectionCopy"),
  ctaText: varchar("ctaText", { length: 255 }),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: varchar("seoDescription", { length: 255 }),
  seoKeywords: text("seoKeywords"),
  htmlStructure: text("htmlStructure"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebsiteResult = typeof websiteResults.$inferSelect;
export type InsertWebsiteResult = typeof websiteResults.$inferInsert;

/**
 * Pricing strategy results
 * Stores pricing tiers, market benchmarks, and recommendations
 */
export const pricingResults = mysqlTable("pricingResults", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  marketBenchmark: json("marketBenchmark"), // { low, average, high }
  recommendedTiers: json("recommendedTiers"), // [{ name, price, description }]
  competitorAnalysis: text("competitorAnalysis"),
  pricingStrategy: text("pricingStrategy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingResult = typeof pricingResults.$inferSelect;
export type InsertPricingResult = typeof pricingResults.$inferInsert;

/**
 * Lead generation templates
 * Stores ad copy, email sequences, and SMS scripts
 */
export const leadResults = mysqlTable("leadResults", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  facebookAdCopy: text("facebookAdCopy"),
  googleAdCopy: text("googleAdCopy"),
  linkedinAdCopy: text("linkedinAdCopy"),
  emailSequence: json("emailSequence"), // [{ subject, body }]
  smsScript: text("smsScript"),
  leadMagnetIdeas: text("leadMagnetIdeas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadResult = typeof leadResults.$inferSelect;
export type InsertLeadResult = typeof leadResults.$inferInsert;

/**
 * Example showcase businesses
 * Pre-generated businesses for the showcase gallery
 */
export const showcaseBusinesses = mysqlTable("showcaseBusinesses", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  featured: mysqlEnum("featured", ["yes", "no"]).default("no").notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShowcaseBusiness = typeof showcaseBusinesses.$inferSelect;
export type InsertShowcaseBusiness = typeof showcaseBusinesses.$inferInsert;
