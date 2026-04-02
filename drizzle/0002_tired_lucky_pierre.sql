CREATE TABLE `businessPlanResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`executiveSummary` text,
	`companyDescription` text,
	`marketAnalysis` text,
	`organizationStructure` text,
	`marketingStrategy` text,
	`operationalPlan` text,
	`financialProjections` json,
	`cashFlowAnalysis` json,
	`breakEvenAnalysis` json,
	`fundingRequirements` text,
	`riskAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businessPlanResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logoResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`logoImageUrl` text,
	`logoPrompt` text,
	`facebookBannerUrl` text,
	`instagramBannerUrl` text,
	`linkedinBannerUrl` text,
	`businessCardUrl` text,
	`faviconUrl` text,
	`appIconUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `logoResults_id` PRIMARY KEY(`id`)
);
