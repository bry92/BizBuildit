CREATE TABLE `brandingResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`tagline` text,
	`brandVoice` text,
	`colorPalette` json,
	`logoDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brandingResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`serviceType` varchar(255) NOT NULL,
	`targetMarket` text,
	`location` varchar(255) NOT NULL,
	`businessGoals` text,
	`status` enum('draft','generated','published') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`facebookAdCopy` text,
	`googleAdCopy` text,
	`linkedinAdCopy` text,
	`emailSequence` json,
	`smsScript` text,
	`leadMagnetIdeas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leadResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricingResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`marketBenchmark` json,
	`recommendedTiers` json,
	`competitorAnalysis` text,
	`pricingStrategy` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricingResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `showcaseBusinesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`featured` enum('yes','no') NOT NULL DEFAULT 'no',
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `showcaseBusinesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `websiteResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`heroTitle` text,
	`heroSubtitle` text,
	`heroDescription` text,
	`featuresSectionCopy` text,
	`ctaText` varchar(255),
	`seoTitle` varchar(255),
	`seoDescription` varchar(255),
	`seoKeywords` text,
	`htmlStructure` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `websiteResults_id` PRIMARY KEY(`id`)
);
