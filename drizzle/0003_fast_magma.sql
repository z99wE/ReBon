CREATE TABLE `agent_negotiations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiatorId` int NOT NULL,
	`targetId` int NOT NULL,
	`category` varchar(64) NOT NULL,
	`proposedKg` varchar(16) NOT NULL,
	`agreedKg` varchar(16),
	`status` enum('pending','agreed','rejected') NOT NULL DEFAULT 'pending',
	`turns` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_negotiations_id` PRIMARY KEY(`id`)
);
