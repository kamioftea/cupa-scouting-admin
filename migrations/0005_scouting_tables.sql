CREATE TABLE `InformationSnippet` (
	`snippetId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`eventId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `InformationSnippet_eventId_index` ON `InformationSnippet` (`eventId`);--> statement-breakpoint
CREATE TABLE `MissionResult` (
	`missionId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scoutingSlotId` integer NOT NULL,
	`opportunityId` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`scoutingSlotId`) REFERENCES `ScoutingSlot`(`scoutingSlotId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `MissionResult_scoutingSlotId_index` ON `MissionResult` (`scoutingSlotId`);--> statement-breakpoint
CREATE TABLE `MissionSnippets` (
	`missionId` integer NOT NULL,
	`snippetId` integer NOT NULL,
	FOREIGN KEY (`missionId`) REFERENCES `MissionResult`(`missionId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`snippetId`) REFERENCES `InformationSnippet`(`snippetId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `MissionSnippets_missionResultId_snippetId_index` ON `MissionSnippets` (`missionId`,`snippetId`);--> statement-breakpoint
CREATE INDEX `MissionSnippets_snippetId_index` ON `MissionSnippets` (`snippetId`);--> statement-breakpoint
CREATE TABLE `MissionUnlocked` (
	`missionId` integer NOT NULL,
	`opportunityId` integer NOT NULL,
	FOREIGN KEY (`missionId`) REFERENCES `MissionResult`(`missionId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `MissionUnlocked_opportunityId_snippetId_index` ON `MissionUnlocked` (`missionId`,`opportunityId`);--> statement-breakpoint
CREATE INDEX `MissionUnlocked_snippetId_index` ON `MissionUnlocked` (`opportunityId`);--> statement-breakpoint
CREATE TABLE `Opportunity` (
	`opportunityId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`name` text NOT NULL,
	`playerDescription` text,
	`opportunityType` text NOT NULL,
	`difficultyLevel` text NOT NULL,
	`threatLevel` text NOT NULL,
	`usefulSkills` text NOT NULL,
	`monsterBriefing` text,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`eventId`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "opportunityType" CHECK("Opportunity"."opportunityType" in ('reconnaissance', 'espionage')),
	CONSTRAINT "difficultyLevel" CHECK("Opportunity"."difficultyLevel" in ('standard', 'difficult')),
	CONSTRAINT "threatLevel" CHECK("Opportunity"."threatLevel" in ('low', 'medium', 'high')),
	CONSTRAINT "Opportunity_usefulSkills_json_valid" CHECK(json_valid("Opportunity"."usefulSkills")),
	CONSTRAINT "Opportunity_requirements_json_valid" CHECK(json_valid("Opportunity"."usefulSkills"))
);
--> statement-breakpoint
CREATE INDEX `Opportunity_eventId_index` ON `Opportunity` (`eventId`);--> statement-breakpoint
CREATE TABLE `OpportunityFollowUp` (
	`sourceOpportunityId` integer NOT NULL,
	`unlockedOpportunityId` integer NOT NULL,
	FOREIGN KEY (`sourceOpportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unlockedOpportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `OpportunityFollowUps_opportunityId_snippetId_index` ON `OpportunityFollowUp` (`sourceOpportunityId`,`unlockedOpportunityId`);--> statement-breakpoint
CREATE INDEX `OpportunityFollowUp_snippetId_index` ON `OpportunityFollowUp` (`unlockedOpportunityId`);--> statement-breakpoint
CREATE TABLE `OpportunityInformationSnippet` (
	`opportunityId` integer NOT NULL,
	`snippetId` integer NOT NULL,
	FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`snippetId`) REFERENCES `InformationSnippet`(`snippetId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `OpportunityInformationSnippet_opportunityId_snippetId_index` ON `OpportunityInformationSnippet` (`opportunityId`,`snippetId`);--> statement-breakpoint
CREATE INDEX `OpportunityInformationSnippet_snippetId_index` ON `OpportunityInformationSnippet` (`snippetId`);--> statement-breakpoint
CREATE TABLE `OpportunitySlot` (
	`opportunityId` integer NOT NULL,
	`monsterSlotId` integer NOT NULL,
	FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`monsterSlotId`) REFERENCES `ScoutingSlot`(`scoutingSlotId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `OpportunitySlot_opportunityId_monsterSlotId_index` ON `OpportunitySlot` (`opportunityId`,`monsterSlotId`);--> statement-breakpoint
CREATE INDEX `OpportunitySlot_monsterSlotId_index` ON `OpportunitySlot` (`monsterSlotId`);