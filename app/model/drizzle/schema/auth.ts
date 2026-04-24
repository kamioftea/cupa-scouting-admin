import {index, integer, sqliteTable, text, uniqueIndex} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
    "User",
    {
        id: integer("id").primaryKey({autoIncrement: true}),
        email: text("email").notNull(),
        name: text("name").notNull(),
    },
    (table) => [uniqueIndex("User_email_key").on(table.email)],
);

export const passwords = sqliteTable(
    "Password",
    {
        id: integer("id").primaryKey({autoIncrement: true}),
        userId: integer("user_id").notNull(),
        hash: text("hash").notNull(),
    },
    (table) => [uniqueIndex("Password_user_id_key").on(table.userId)],
);

export const resetPasswordTokens = sqliteTable(
    "ResetPasswordToken",
    {
        id: integer("id").primaryKey({autoIncrement: true}),
        email: text("email").notNull(),
        token: text("token").notNull(),
        expiresAt: text("expiresAt").notNull(),
    },
    (table) => [uniqueIndex("ResetPasswordToken_token_key").on(table.token)],
);

export const changeEmailTokens = sqliteTable(
    "ChangeEmailToken",
    {
        id: integer("id").primaryKey({autoIncrement: true}),
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
        id: integer("id").primaryKey({autoIncrement: true}),
        name: text("name").notNull(),
    },
    (table) => [uniqueIndex("Role_name_key").on(table.name)],
);

export const rolesToUsers = sqliteTable(
    "_RoleToUser",
    {
        roleId: integer("A")
        .notNull()
        .references(() => roles.id, {onDelete: "cascade", onUpdate: "cascade"}),
        userId: integer("B")
        .notNull()
        .references(() => users.id, {onDelete: "cascade", onUpdate: "cascade"}),
    },
    (table) => [
        uniqueIndex("_RoleToUser_AB_unique").on(table.roleId, table.userId),
        index("_RoleToUser_B_index").on(table.userId),
    ],
);

export type UserRow = typeof users.$inferSelect;
export type ResetPasswordTokenRow = typeof resetPasswordTokens.$inferSelect;
export type ChangeEmailTokenRow = typeof changeEmailTokens.$inferSelect;
