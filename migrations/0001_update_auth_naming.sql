ALTER TABLE `ChangeEmailToken` RENAME COLUMN "id" TO "changeTokenId";--> statement-breakpoint
ALTER TABLE `Password` RENAME COLUMN "id" TO "passwordId";--> statement-breakpoint
ALTER TABLE `Password` RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE `ResetPasswordToken` RENAME COLUMN "id" TO "resetTokenId";--> statement-breakpoint
ALTER TABLE `Role` RENAME COLUMN "id" TO "roleId";--> statement-breakpoint
ALTER TABLE `User` RENAME COLUMN "id" TO "userId";--> statement-breakpoint
DROP INDEX `Password_user_id_key`;--> statement-breakpoint
CREATE UNIQUE INDEX `Password_user_id_key` ON `Password` (`userId`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new__RoleToUser` (
    `roleId` integer NOT NULL,
    `userId` integer NOT NULL,
    FOREIGN KEY (`roleId`) REFERENCES `Role`(`roleId`) ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint

-- Remove orphan links that would violate new FK checks
DELETE FROM `_RoleToUser`
WHERE `A` NOT IN (SELECT `roleId` FROM `Role`)
   OR `B` NOT IN (SELECT `userId` FROM `User`);
--> statement-breakpoint

INSERT INTO `__new__RoleToUser`("roleId", "userId")
SELECT "A", "B" FROM `_RoleToUser`;
--> statement-breakpoint
DROP TABLE `_RoleToUser`;--> statement-breakpoint
ALTER TABLE `__new__RoleToUser` RENAME TO `_RoleToUser`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `_RoleToUser_roleUser_unique` ON `_RoleToUser` (`roleId`,`userId`);--> statement-breakpoint
CREATE INDEX `_RoleToUser_userId_index` ON `_RoleToUser` (`userId`);
