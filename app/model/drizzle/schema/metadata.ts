// noinspection JSUnusedGlobalSymbols

import {check, index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {relations, sql} from "drizzle-orm";
import {
  opportunityFollowUpEncounters,
  opportunityNPCs,
  opportunitySourceEncounters,
  opportunityStatBlocks
} from "./scouting";

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

export const encounters = sqliteTable(
  "Encounter",
  {
    encounterId: integer("encounterId").primaryKey({autoIncrement: true}),
    eventId: integer("eventId").notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    produceEncounterOpportunity: integer("produceEncounterOpportunity", {mode: "boolean"}).notNull(),
    playerDescription: text("playerDescription"),
    usefulSkills: text("usefulSkills", {mode: "json"}).$type<string[]>().notNull(),
    requirements: text("requirements", {mode: "json"}).$type<string[]>().notNull(),
  },
  (table) => [
    index("Encounter_eventId_index").on(table.eventId),
    check("Opportunity_usefulSkills_json_valid", sql`json_valid(${table.usefulSkills})`),
    check("Opportunity_requirements_json_valid", sql`json_valid(${table.requirements})`),
  ]
)

export const statBlockRelations =
  relations(statBlocks, ({many}) => ({
    npcs: many(statBlocks),
    opportunities: many(opportunityStatBlocks),
  }));

export const npcRelations =
  relations(npcs, ({one, many}) => ({
    statBlock: one(statBlocks, {
      fields: [npcs.statBlockId],
      references: [statBlocks.statBlockId],
    }),
    opportunities: many(opportunityNPCs),
  }));

export const encounterRelations =
  relations(encounters, ({one, many}) => ({
    event: one(encounters, {
      fields: [encounters.eventId],
      references: [encounters.eventId],
    }),
    unlocksOpportunities: many(opportunitySourceEncounters),
    unlockedBy: many(opportunityFollowUpEncounters),
  }));

export type StatBlockRow = typeof statBlocks.$inferSelect;
export type NPCRow = typeof npcs.$inferSelect;
export type EncounterRow = typeof encounters.$inferSelect;
