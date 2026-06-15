ALTER TABLE `collective_members` ADD CONSTRAINT `collective_members_collectiveId_userId_unique` UNIQUE(`collectiveId`,`userId`);--> statement-breakpoint
ALTER TABLE `leaderboard_entries` ADD CONSTRAINT `leaderboard_entries_seasonId_userId_unique` UNIQUE(`seasonId`,`userId`);--> statement-breakpoint
CREATE INDEX `idx_activity_user_id` ON `activities` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_activity_created_at` ON `activities` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_user_created` ON `activities` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_challenge_user_id` ON `challenges` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_week_year` ON `challenges` (`weekNumber`,`year`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `challenges` (`status`);--> statement-breakpoint
CREATE INDEX `idx_collective_id` ON `collective_members` (`collectiveId`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `collective_members` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_feed_created_at` ON `feed_items` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_feed_user_id` ON `feed_items` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_season_id` ON `leaderboard_entries` (`seasonId`);--> statement-breakpoint
CREATE INDEX `idx_rank` ON `leaderboard_entries` (`rank`);--> statement-breakpoint
CREATE INDEX `idx_snapshot_user_id` ON `peer_snapshots` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_snapshot_date` ON `peer_snapshots` (`snapshotDate`);