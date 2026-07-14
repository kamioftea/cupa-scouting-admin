PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Encounter` (
	`encounterId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`produceEncounterOpportunity` integer NOT NULL,
	`playerDescription` text,
	`usefulSkills` text NOT NULL,
	`requirements` text NOT NULL,
	CONSTRAINT "Opportunity_usefulSkills_json_valid" CHECK(json_valid("__new_Encounter"."usefulSkills")),
	CONSTRAINT "Opportunity_requirements_json_valid" CHECK(json_valid("__new_Encounter"."requirements"))
);
--> statement-breakpoint
INSERT INTO `__new_Encounter`("encounterId", "eventId", "code", "name", "produceEncounterOpportunity", "playerDescription", "usefulSkills", "requirements") SELECT "encounterId", "eventId", "code", "name", "produceEncounterOpportunity", "playerDescription", "usefulSkills", "requirements" FROM `Encounter`;--> statement-breakpoint
DROP TABLE `Encounter`;--> statement-breakpoint
ALTER TABLE `__new_Encounter` RENAME TO `Encounter`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `Encounter_eventId_index` ON `Encounter` (`eventId`);