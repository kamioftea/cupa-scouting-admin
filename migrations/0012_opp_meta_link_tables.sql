CREATE TABLE `OpportunityNPC` (
	`opportunityId` integer NOT NULL,
	`npcId` integer NOT NULL,
	FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`npcId`) REFERENCES `NPC`(`npcId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `OpportunityNPC_opportunityId_npcId_index` ON `OpportunityNPC` (`opportunityId`,`npcId`);--> statement-breakpoint
CREATE INDEX `OpportunityNPC_npcId_index` ON `OpportunityNPC` (`npcId`);--> statement-breakpoint
CREATE TABLE `OpportunityStatBlock` (
	`opportunityId` integer NOT NULL,
	`statBlockId` integer NOT NULL,
	FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`opportunityId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`statBlockId`) REFERENCES `StatBlock`(`statBlockId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `OpportunityStatBlock_opportunityId_statBlockId_index` ON `OpportunityStatBlock` (`opportunityId`,`statBlockId`);--> statement-breakpoint
CREATE INDEX `OpportunityStatBlock_statBlockId_index` ON `OpportunityStatBlock` (`statBlockId`);--> statement-breakpoint
ALTER TABLE `StatBlock` ADD `workUnits` integer;