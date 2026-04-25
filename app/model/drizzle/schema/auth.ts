import {index, integer, sqliteTable, text, uniqueIndex} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
    "User",
    {
        userId: integer("userId").primaryKey({autoIncrement: true}),
        email: text("email").notNull(),
        name: text("name").notNull(),
    },
    (table) => [uniqueIndex("User_email_key").on(table.email)],
);

export const passwords = sqliteTable(
    "Password",
    {
        passwordId: integer("passwordId").primaryKey({autoIncrement: true}),
        userId: integer("userId").notNull(),
        hash: text("hash").notNull(),
    },
    (table) => [uniqueIndex("Password_user_id_key").on(table.userId)],
);

export const resetPasswordTokens = sqliteTable(
    "ResetPasswordToken",
    {
        resetTokenId: integer("resetTokenId").primaryKey({autoIncrement: true}),
        email: text("email").notNull(),
        token: text("token").notNull(),
        expiresAt: text("expiresAt").notNull(),
    },
    (table) => [uniqueIndex("ResetPasswordToken_token_key").on(table.token)],
);

export const changeEmailTokens = sqliteTable(
    "ChangeEmailToken",
    {
        changeTokenId: integer("changeTokenId").primaryKey({autoIncrement: true}),
        oldEmail: text("old_email").notNull(),
        newEmail: text("new_email").notNull(),
        token: text("token").notNull(),
        expiresAt: text("expiresAt").notNull(),
    },
    (table) => [uniqueIndex("ChangeEmailToken_token_key").on(table.token)],
);

export const roles = sqliteTable(
    "Role",
    {
        roleId: integer("roleId").primaryKey({autoIncrement: true}),
        name: text("name").notNull(),
    },
    (table) => [uniqueIndex("Role_name_key").on(table.name)],
);

export const rolesToUsers = sqliteTable(
    "_RoleToUser",
    {
        roleId: integer("roleId")
        .notNull()
        .references(() => roles.roleId, {onDelete: "cascade", onUpdate: "cascade"}),
        userId: integer("userId")
        .notNull()
        .references(() => users.userId, {onDelete: "cascade", onUpdate: "cascade"}),
    },
    (table) => [
        uniqueIndex("_RoleToUser_roleUser_unique").on(table.roleId, table.userId),
        index("_RoleToUser_userId_index").on(table.userId),
    ],
);

export type UserRow = typeof users.$inferSelect;
export type ResetPasswordTokenRow = typeof resetPasswordTokens.$inferSelect;
export type ChangeEmailTokenRow = typeof changeEmailTokens.$inferSelect;
