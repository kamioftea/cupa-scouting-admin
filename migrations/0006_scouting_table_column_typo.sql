PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Opportunity` (
	`opportunityId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`name` text NOT NULL,
	`playerDescription` text,
	`opportunityType` text NOT NULL,
	`difficultyLevel` text NOT NULL,
	`threatLevel` text NOT NULL,
	`usefulSkills` text NOT NULL,
	`requirements` text NOT NULL,
	`monsterBriefing` text,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`eventId`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "opportunityType" CHECK("__new_Opportunity"."opportunityType" in ('reconnaissance', 'espionage')),
	CONSTRAINT "difficultyLevel" CHECK("__new_Opportunity"."difficultyLevel" in ('standard', 'difficult')),
	CONSTRAINT "threatLevel" CHECK("__new_Opportunity"."threatLevel" in ('low', 'medium', 'high')),
	CONSTRAINT "Opportunity_usefulSkills_json_valid" CHECK(json_valid("__new_Opportunity"."usefulSkills")),
	CONSTRAINT "Opportunity_requirements_json_valid" CHECK(json_valid("__new_Opportunity"."requirements"))
);
--> statement-breakpoint
INSERT INTO `__new_Opportunity`("opportunityId", "eventId", "name", "playerDescription", "opportunityType", "difficultyLevel", "threatLevel", "usefulSkills", "requirements", "monsterBriefing") SELECT "opportunityId", "eventId", "name", "playerDescription", "opportunityType", "difficultyLevel", "threatLevel", "usefulSkills", "requirements", "monsterBriefing" FROM `Opportunity`;--> statement-breakpoint
DROP TABLE `Opportunity`;--> statement-breakpoint
ALTER TABLE `__new_Opportunity` RENAME TO `Opportunity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `Opportunity_eventId_index` ON `Opportunity` (`eventId`);