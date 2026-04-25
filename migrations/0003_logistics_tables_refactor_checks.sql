PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_MonsterSlot` (
	`monsterSlotId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`status` text NOT NULL,
	`startTime` text NOT NULL,
	`faction` text,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`eventId`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "MonsterSlot_day_check" CHECK("__new_MonsterSlot"."status" in ('fri', 'sat', 'sun', 'mon')),
	CONSTRAINT "MonsterSlot_faction_check" CHECK(("__new_MonsterSlot"."faction" is null or "__new_MonsterSlot"."faction" in ('al_gaia', 'fir_cruthen', 'jhereg', 'kabourashi', 'lions', 'mercenaries', 'steppe', 'teutonians', 'wolves')))
);
--> statement-breakpoint
INSERT INTO `__new_MonsterSlot`("monsterSlotId", "eventId", "status", "startTime", "faction") SELECT "monsterSlotId", "eventId", "status", "startTime", "faction" FROM `MonsterSlot`;--> statement-breakpoint
DROP TABLE `MonsterSlot`;--> statement-breakpoint
ALTER TABLE `__new_MonsterSlot` RENAME TO `MonsterSlot`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `MonsterSlot_eventId_index` ON `MonsterSlot` (`eventId`);