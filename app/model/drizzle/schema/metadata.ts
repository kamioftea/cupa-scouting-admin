// noinspection JSUnusedGlobalSymbols

import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {relations} from "drizzle-orm";

export const statBlocks = sqliteTable(
    "StatBlock",
    {
        statBlockId: integer("statBlockId").primaryKey({autoIncrement: true}),
        name: text("name").notNull(),
        creatureClass: text("creatureClass"),
        hits: text("hits"),
        magicPoints: integer("magicPoints"),
        staminaPoints: integer("staminaPoints"),
        workUnits: integer("workUnits"),
        specialAttacks: text("specialAttacks"),
        abilities: text("abilities"),
        skills: text("skills"),
        items: text("items"),
        vulnerabilities: text("vulnerabilities"),
        immunities: text("immunities"),
    }
);

export const npcs = sqliteTable(
    "NPC",
    {
        npcId: integer().primaryKey({autoIncrement: true}),
        name: text("name").notNull(),
        player: text("player"),
        overview: text("overview"),
        statBlockId: integer("statBlockId").references(() => statBlocks.statBlockId),
    },
    (table) => [
        index("NPC_statBlockId_index").on(table.statBlockId)
    ]
);

export const statBlockRelations =
    relations(statBlocks, ({many}) => ({
        npcs: many(statBlocks),
    }));

export const npcRelations =
    relations(npcs, ({ one }) => ({
        statBlock: one(statBlocks, {
            fields: [npcs.statBlockId],
            references: [statBlocks.statBlockId],
        }),
    }))

export type StatBlockRow = typeof statBlocks.$inferSelect;
export type NPCRow = typeof npcs.$inferSelect;
