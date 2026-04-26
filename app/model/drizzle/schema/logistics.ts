// noinspection JSUnusedGlobalSymbols

import {index, integer, sqliteTable, text, uniqueIndex} from "drizzle-orm/sqlite-core";
import {enumCheck} from "../helpers";
import {relations} from "drizzle-orm";

export const events = sqliteTable(
    "Event",
    {
        eventId: integer("eventId").primaryKey({autoIncrement: true}),
        slug: text("slug").notNull(),
        name: text("name").notNull(),
        description: text("description"),
        startDate: text("startDate").notNull(),
    },
    (table) => [
        uniqueIndex("Event_slug_unique").on(table.slug)
    ]
);

export const eventRelations = relations(
    events,
    ({many}) => ({
        monsterSlots: many(monsterSlots),
    })
);

export const days: [string, ...string[]] = ['fri', 'sat', 'sun', 'mon'] as const
export const factions: [string, ...string[]] = [
    'al_gaia',
    'fir_cruthen',
    'jhereg',
    'kabourashi',
    'lions',
    'mercenaries',
    'steppe',
    'teutonians',
    'wolves'
] as const

export const monsterSlots = sqliteTable(
    "MonsterSlot",
    {
        monsterSlotId: integer("monsterSlotId").primaryKey({autoIncrement: true}),
        eventId:
            integer("eventId")
            .references(() => events.eventId, {onDelete: "cascade", onUpdate: "cascade"})
            .notNull(),
        day: text("status", {enum: days}).notNull(),
        startTime: text().notNull(),
        faction: text("faction", {enum: factions}),
    },
    (table) => [
        index("MonsterSlot_eventId_index").on(table.eventId),
        enumCheck(table.day, "MonsterSlot_day_check", days),
        enumCheck(table.faction, "MonsterSlot_faction_check", factions, true),
    ]
)

export const monsterSlotRelations = relations(
    monsterSlots,
    ({one, many}) => ({
        event: one(events),
        scoutingSlots: many(scoutingSlots),
    })
);

export const scoutingSlots = sqliteTable(
    "ScoutingSlot",
    {
        scoutingSlotId: integer("scoutingSlotId").primaryKey({autoIncrement: true}),
        monsterSlotId:
            integer("monsterSlotId")
            .references(() => monsterSlots.monsterSlotId, {onDelete: "cascade", onUpdate: "cascade"})
            .notNull(),
        startTime: text().notNull(),
    },
    (table) => [
        index("ScoutingSlot_monsterSlotId_index").on(table.monsterSlotId),
    ]
)

export const scoutingSlotRelations = relations(
    monsterSlots,
    ({one}) => ({
        monsterSlot: one(monsterSlots),
    })
);

export type EventRow = typeof events.$inferSelect;
export type MonsterSlotRow = typeof monsterSlots.$inferSelect;
export type ScoutingSlotRow = typeof scoutingSlots.$inferSelect;


