CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('transport','meals','energy','shopping','other') NOT NULL,
	`subcategory` varchar(64) NOT NULL,
	`label` varchar(128) NOT NULL,
	`carbonKg` float NOT NULL,
	`quantity` float DEFAULT 1,
	`unit` varchar(32),
	`inputMethod` enum('tap','voice','manual') NOT NULL DEFAULT 'tap',
	`voiceTranscript` text,
	`notes` text,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`category` enum('transport','meals','energy','shopping','lifestyle') NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`carbonSavingKg` float NOT NULL,
	`pointsReward` int NOT NULL DEFAULT 100,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`status` enum('active','completed','skipped','expired') NOT NULL DEFAULT 'active',
	`completedAt` timestamp,
	`aiProvider` varchar(32),
	`trendingTopic` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collective_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectiveId` int NOT NULL,
	`userId` int NOT NULL,
	`contributionKg` float NOT NULL DEFAULT 0,
	`role` enum('admin','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collective_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collectives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`creatorId` int NOT NULL,
	`inviteCode` varchar(16) NOT NULL,
	`totalCarbonKg` float NOT NULL DEFAULT 0,
	`memberCount` int NOT NULL DEFAULT 1,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collectives_id` PRIMARY KEY(`id`),
	CONSTRAINT `collectives_inviteCode_unique` UNIQUE(`inviteCode`)
);
--> statement-breakpoint
CREATE TABLE `feed_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('activity','challenge_complete','story','milestone','collective_join') NOT NULL,
	`title` varchar(256) NOT NULL,
	`body` text,
	`carbonKg` float,
	`isInfluencer` boolean NOT NULL DEFAULT false,
	`amplified` boolean NOT NULL DEFAULT false,
	`likeCount` int NOT NULL DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feed_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influence_edges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceUserId` int NOT NULL,
	`targetUserId` int NOT NULL,
	`weight` float NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `influence_edges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`userId` int NOT NULL,
	`rank` int,
	`eloScore` int NOT NULL DEFAULT 1000,
	`carbonSavedKg` float NOT NULL DEFAULT 0,
	`activitiesLogged` int NOT NULL DEFAULT 0,
	`challengesCompleted` int NOT NULL DEFAULT 0,
	`influenceScore` float NOT NULL DEFAULT 0,
	`rivalUserId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard_seasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonNumber` int NOT NULL,
	`year` int NOT NULL,
	`weekNumber` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leaderboard_seasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `peer_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`archetype` varchar(64) NOT NULL,
	`userCarbonKg` float NOT NULL,
	`peerAvgKg` float NOT NULL,
	`percentileRank` float NOT NULL,
	`categoryBreakdown` json,
	`peerCategoryBreakdown` json,
	`snapshotDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `peer_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`narrative` text NOT NULL,
	`headline` varchar(256) NOT NULL,
	`carbonSavedKg` float NOT NULL,
	`equivalents` json,
	`period` enum('week','month','alltime') NOT NULL DEFAULT 'week',
	`shareCount` int NOT NULL DEFAULT 0,
	`aiProvider` varchar(32),
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `archetype` enum('urban_commuter','conscious_consumer','energy_heavy','eco_pioneer','suburban_family','digital_nomad');--> statement-breakpoint
ALTER TABLE `users` ADD `archetypeLabel` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingCompleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingAnswers` json;--> statement-breakpoint
ALTER TABLE `users` ADD `roadmap` json;--> statement-breakpoint
ALTER TABLE `users` ADD `totalCarbonKg` float DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `weeklyBudgetKg` float DEFAULT 70 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `eloScore` int DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `influenceScore` float DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `currentStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `longestStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` varchar(10) DEFAULT 'en';