CREATE TABLE `Event` (
	`eventId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`startDate` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `MonsterSlot` (
	`monsterSlotId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`status` text NOT NULL,
	`startTime` text NOT NULL,
	`faction` text,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`eventId`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "MonsterSlot_day_check" CHECK("MonsterSlot"."status" in ('fri', 'sat', 'sun', 'mon')),
	CONSTRAINT "MonsterSlot_faction_check" CHECK("MonsterSlot"."faction" is null or "MonsterSlot"
	    ."faction" in ('al_gaia', 'fir_cruthen', 'jhereg', 'kabourashi', 'lions', 'mercenaries', 'steppe', 'teutonians', 'wolves'))
);
--> statement-breakpoint
CREATE INDEX `MonsterSlot_eventId_index` ON `MonsterSlot` (`eventId`);--> statement-breakpoint
CREATE TABLE `ScoutingSlot` (
	`scoutingSlotId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monsterSlotId` integer NOT NULL,
	`startTime` text NOT NULL,
	FOREIGN KEY (`monsterSlotId`) REFERENCES `MonsterSlot`(`monsterSlotId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ScoutingSlot_monsterSlotId_index` ON `ScoutingSlot` (`monsterSlotId`);
