import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {enumCheck} from "../helpers";
import {relations} from "drizzle-orm";

export const event = sqliteTable(
    "Event",
    {
        eventId: integer("eventId").primaryKey({autoIncrement: true}),
        name: text("name").notNull(),
        description: text("description"),
        startDate: text("startDate").notNull(),
    },
);

export const eventRelations = relations(
    event,
    ({many}) => ({
        monsterSlots: many(monsterSlot),
    })
);

export const days: [string, ...string[]] = ['fri', 'sat', 'sun', 'mon']
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
]

export const monsterSlot = sqliteTable(
    "MonsterSlot",
    {
        monsterSlotId: integer("monsterSlotId").primaryKey({autoIncrement: true}),
        eventId:
            integer("eventId")
            .references(() => event.eventId, {onDelete: "cascade", onUpdate: "cascade"})
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
    monsterSlot,
    ({one, many}) => ({
        event: one(event),
        scoutingSlots: many(scoutingSlot),
    })
);

export const scoutingSlot = sqliteTable(
    "ScoutingSlot",
    {
        scoutingSlotId: integer("scoutingSlotId").primaryKey({autoIncrement: true}),
        monsterSlotId:
            integer("monsterSlotId")
            .references(() => monsterSlot.monsterSlotId, {onDelete: "cascade", onUpdate: "cascade"})
            .notNull(),
        startTime: text().notNull(),
    },
    (table) => [
        index("ScoutingSlot_monsterSlotId_index").on(table.monsterSlotId),
    ]
)

export const scoutingSlotRelations = relations(
    monsterSlot,
    ({one}) => ({
        monsterSlot: one(monsterSlot),
    })
);


