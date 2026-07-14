CREATE TABLE `Encounter` (
	`encounterId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`produceEncounterOpportunity` integer NOT NULL,
	`usefulSkills` text NOT NULL,
	`requirements` text NOT NULL,
	CONSTRAINT "Opportunity_usefulSkills_json_valid" CHECK(json_valid("Encounter"."usefulSkills")),
	CONSTRAINT "Opportunity_requirements_json_valid" CHECK(json_valid("Encounter"."requirements"))
);
--> statement-breakpoint
CREATE INDEX `Encounter_eventId_index` ON `Encounter` (`eventId`);