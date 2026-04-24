CREATE TABLE `ChangeEmailToken` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`old_email` text NOT NULL,
	`new_email` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ChangeEmailToken_token_key` ON `ChangeEmailToken` (`token`);--> statement-breakpoint
CREATE TABLE `Password` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Password_user_id_key` ON `Password` (`user_id`);--> statement-breakpoint
CREATE TABLE `ResetPasswordToken` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ResetPasswordToken_token_key` ON `ResetPasswordToken` (`token`);--> statement-breakpoint
CREATE TABLE `Role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Role_name_key` ON `Role` (`name`);--> statement-breakpoint
CREATE TABLE `_RoleToUser` (
	`A` integer NOT NULL,
	`B` integer NOT NULL,
	FOREIGN KEY (`A`) REFERENCES `Role`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_RoleToUser_AB_unique` ON `_RoleToUser` (`A`,`B`);--> statement-breakpoint
CREATE INDEX `_RoleToUser_B_index` ON `_RoleToUser` (`B`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);