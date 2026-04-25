-- noinspection SqlAddNotNullColumn
ALTER TABLE `Event` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `Event_slug_unique` ON `Event` (`slug`);
