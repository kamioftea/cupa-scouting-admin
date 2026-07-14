CREATE TABLE `OpportunityFollowUpEncounter` (
	`opportunityId` integer NOT NULL,
	`encounterId` integer NOT NULL,
	FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`encounterId`) REFERENCES `Encounter`(`encounterId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `OpportunityFollowUpEncounter_opportunityId_encounterId_index` ON `OpportunityFollowUpEncounter` (`opportunityId`,`encounterId`);--> statement-breakpoint
CREATE INDEX `OpportunityFollowUpEncounter_encounterId_index` ON `OpportunityFollowUpEncounter` (`encounterId`);--> statement-breakpoint
CREATE TABLE `OpportunitySourceEncounter` (
	`opportunityId` integer NOT NULL,
	`encounterId` integer NOT NULL,
	FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`encounterId`) REFERENCES `Encounter`(`encounterId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `OpportunitySourceEncounter_opportunityId_encounterId_index` ON `OpportunitySourceEncounter` (`opportunityId`,`encounterId`);--> statement-breakpoint
CREATE INDEX `OpportunitySourceEncounter_encounterId_index` ON `OpportunitySourceEncounter` (`encounterId`);