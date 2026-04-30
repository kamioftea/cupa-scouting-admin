CREATE TABLE `NPC` (
	`npcId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`player` text,
	`overview` text,
	`statBlockId` integer,
	FOREIGN KEY (`statBlockId`) REFERENCES `StatBlock`(`statBlockId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `NPC_statBlockId_index` ON `NPC` (`statBlockId`);--> statement-breakpoint
CREATE TABLE `StatBlock` (
	`statBlockId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`creatureClass` text,
	`hits` text,
	`magicPoints` integer,
	`staminaPoints` integer,
	`specialAttacks` text,
	`abilities` text,
	`skills` text,
	`items` text
);
