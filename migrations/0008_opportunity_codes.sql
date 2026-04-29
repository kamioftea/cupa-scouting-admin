PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Opportunity` (
    `opportunityId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `eventId` integer NOT NULL,
    `code` text NOT NULL,
    `name` text NOT NULL,
    `playerDescription` text,
    `opportunityType` text NOT NULL,
    `difficultyLevel` text NOT NULL,
    `threatLevel` text NOT NULL,
    `usefulSkills` text NOT NULL,
    `requirements` text NOT NULL,
    `monsterBriefing` text,
    `expectedResult` text,
    FOREIGN KEY (`eventId`) REFERENCES `Event`(`eventId`) ON UPDATE no action ON DELETE no action,
    CONSTRAINT `opportunityType` CHECK(`opportunityType` in ('reconnaissance','espionage')),
    CONSTRAINT `difficultyLevel` CHECK(`difficultyLevel` in ('standard','difficult')),
    CONSTRAINT `threatLevel` CHECK(`threatLevel` in ('low','medium','high')),
    CONSTRAINT `Opportunity_usefulSkills_json_valid` CHECK(json_valid(`usefulSkills`)),
    CONSTRAINT `Opportunity_requirements_json_valid` CHECK(json_valid(`requirements`))
);--> statement-breakpoint
INSERT INTO `__new_Opportunity` (
    `opportunityId`,`eventId`,`code`,`name`,`playerDescription`,`opportunityType`,
    `difficultyLevel`,`threatLevel`,`usefulSkills`,`requirements`,`monsterBriefing`,`expectedResult`
)
SELECT
    `opportunityId`,`eventId`,'S' || printf('%03d', `opportunityId`),`name`,`playerDescription`,`opportunityType`,
    `difficultyLevel`,`threatLevel`,`usefulSkills`,`requirements`,`monsterBriefing`,`expectedResult`
FROM `Opportunity`;--> statement-breakpoint

DROP TABLE `Opportunity`;--> statement-breakpoint
ALTER TABLE `__new_Opportunity` RENAME TO `Opportunity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint

CREATE UNIQUE INDEX `Opportunity_eventId_code_unique` ON `Opportunity` (`eventId`,`code`);
