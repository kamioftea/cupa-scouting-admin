// noinspection JSUnusedGlobalSymbols

import {check, index, integer, sqliteTable, text, uniqueIndex} from "drizzle-orm/sqlite-core";
import {events, monsterSlots, scoutingSlots} from "./logistics";
import {enumCheck} from "../helpers";
import {relations, sql} from "drizzle-orm";

export const opportunityTypes = ['reconnaissance', 'espionage'] as const;
export const difficultyLevels = ['standard', 'difficult'] as const;
export const threatLevels = ['low', 'medium', 'high'] as const;

export const opportunities = sqliteTable(
    "Opportunity",
    {
        opportunityId: integer("opportunityId").primaryKey({autoIncrement: true}),
        eventId: integer("eventId").notNull().references(() => events.eventId),
        code: text("code").notNull(),
        name: text("name").notNull(),
        playerDescription: text(),
        opportunityType: text("opportunityType", {enum: opportunityTypes}).notNull(),
        difficultyLevel: text("difficultyLevel", {enum: difficultyLevels}).notNull(),
        threatLevel: text("threatLevel", {enum: threatLevels}).notNull(),
        usefulSkills: text("usefulSkills", { mode: "json" }).$type<string[]>().notNull(),
        requirements: text("requirements", { mode: "json" }).$type<string[]>().notNull(),
        monsterBriefing: text("monsterBriefing"),
        expectedResult: text("expectedResult"),
    },
    (table) => [
        uniqueIndex("Opportunity_eventId_code_unique").on(table.eventId, table.code),
        enumCheck(table.opportunityType, "opportunityType", opportunityTypes),
        enumCheck(table.difficultyLevel, "difficultyLevel", difficultyLevels),
        enumCheck(table.threatLevel, "threatLevel", threatLevels),
        check("Opportunity_usefulSkills_json_valid", sql`json_valid(${table.usefulSkills})`),
        check("Opportunity_requirements_json_valid", sql`json_valid(${table.requirements})`),
    ],
);

export const informationSnippets = sqliteTable(
    "InformationSnippet",
    {
        snippetId: integer("snippetId").primaryKey({autoIncrement: true}),
        eventId: integer("eventId").notNull().references(() => events.eventId),
        content: text("content").notNull(),
    },
    (table) => [
        index("InformationSnippet_eventId_index").on(table.eventId),
    ]
);

export const missionResults = sqliteTable(
    "MissionResult",
    {
        missionId: integer("missionId").primaryKey({autoIncrement: true}),
        scoutingSlotId: integer("scoutingSlotId").notNull().references(() => scoutingSlots.scoutingSlotId),
        opportunityId: integer("opportunityId").notNull().references(() => opportunities.opportunityId),
        result: text("content").notNull(),
    },
    (table) => [
        uniqueIndex("MissionResult_scoutingSlotId_index").on(table.scoutingSlotId)
    ]
);

export const opportunityInformationSnippets = sqliteTable(
    "OpportunityInformationSnippet",
    {
        opportunityId: integer("opportunityId").notNull().references(() => opportunities.opportunityId),
        snippetId: integer("snippetId").notNull().references(() => informationSnippets.snippetId),
    },
    (table) => [
        uniqueIndex("OpportunityInformationSnippet_opportunityId_snippetId_index").on(table.opportunityId, table.snippetId),
        index("OpportunityInformationSnippet_snippetId_index").on(table.snippetId),
    ],
);

export const opportunityFollowUps = sqliteTable(
    "OpportunityFollowUp",
    {
        sourceOpportunityId: integer("sourceOpportunityId").notNull().references(() => opportunities.opportunityId),
        unlockedOpportunityId: integer("unlockedOpportunityId").notNull().references(() => opportunities.opportunityId),
    },
    (table) => [
        uniqueIndex("OpportunityFollowUps_opportunityId_snippetId_index").on(table.sourceOpportunityId, table.unlockedOpportunityId),
        index("OpportunityFollowUp_snippetId_index").on(table.unlockedOpportunityId),
    ],
);

export const opportunitySlotAvailabilities = sqliteTable(
    "OpportunitySlot",
    {
        opportunityId: integer("opportunityId").notNull().references(() => opportunities.opportunityId),
        monsterSlotId: integer("monsterSlotId").notNull().references(() => scoutingSlots.scoutingSlotId),
    },
    (table) => [
        uniqueIndex("OpportunitySlot_opportunityId_monsterSlotId_index").on(table.opportunityId, table.monsterSlotId),
        index("OpportunitySlot_monsterSlotId_index").on(table.monsterSlotId),
    ],
)

export const missionUnlocked = sqliteTable(
    "MissionUnlocked",
    {
        missionId: integer("missionId").notNull().references(() => missionResults.missionId),
        opportunityId: integer("opportunityId").notNull().references(() => opportunities.opportunityId),
    },
    (table) => [
        uniqueIndex("MissionUnlocked_opportunityId_snippetId_index").on(table.missionId, table.opportunityId),
        index("MissionUnlocked_snippetId_index").on(table.opportunityId),
    ],
);

export const missionSnippets = sqliteTable(
    "MissionSnippets",
    {
        missionId: integer("missionId").notNull().references(() => missionResults.missionId),
        snippetId: integer("snippetId").notNull().references(() => informationSnippets.snippetId),
    },
    (table) => [
        uniqueIndex("MissionSnippets_missionResultId_snippetId_index").on(table.missionId, table.snippetId),
        index("MissionSnippets_snippetId_index").on(table.snippetId),
    ]
);

export const opportunityRelations = relations(
    opportunities,
    ({many}) => ({
        suggestedSnippets: many(opportunityInformationSnippets),
        missions: many(missionResults),
        monsterSlots: many(opportunitySlotAvailabilities),
        unlocks: many(opportunityFollowUps, {
            relationName: "sourceOpportunityFollowUps",
        }),
        unlockedByOpportunities: many(opportunityFollowUps, {
            relationName: "unlockedOpportunityFollowUps",
        }),
        unlockedByMissions: many(missionUnlocked),
    })
);

export const informationSnippetRelations = relations(
    informationSnippets,
    ({one, many}) => ({
        event: one(events),
        opportunities: many(opportunityInformationSnippets),
        missions: many(missionSnippets),
    })
);

export const missionResultRelations = relations(
    missionResults,
    ({one, many}) => ({
        opportunity: one(opportunities),
        scoutingSlot: one(scoutingSlots),
        snippets: many(missionSnippets),
        unlocked: many(missionUnlocked)
    })
);

export const opportunityInformationSnippetsJoin = relations(
    opportunityInformationSnippets,
    ({one}) => ({
        opportunity: one(opportunities),
        snippet: one(informationSnippets),
    })
);

export const opportunityMonsterSlotsJoin = relations(
    opportunitySlotAvailabilities,
    ({one}) => ({
        opportunity: one(opportunities),
        monsterSlot: one(monsterSlots),
    })
);

export const missionInformationSnippetsJoin = relations(
    missionSnippets,
    ({one}) => ({
        mission: one(missionResults),
        snippet: one(informationSnippets),
    })
);

export const missionUnlockedOpportunitiesJoin = relations(
    missionUnlocked,
    ({one}) => ({
        mission: one(missionResults),
        opportunity: one(opportunities),
    })
);

export const opportunityFollowUpRelations = relations(
    opportunityFollowUps,
    ({ one }) => ({
        sourceOpportunity: one(opportunities, {
            fields: [opportunityFollowUps.sourceOpportunityId],
            references: [opportunities.opportunityId],
            relationName: "sourceOpportunityFollowUps",
        }),
        unlockedOpportunity: one(opportunities, {
            fields: [opportunityFollowUps.unlockedOpportunityId],
            references: [opportunities.opportunityId],
            relationName: "unlockedOpportunityFollowUps",
        }),
    }),
);

export type OpportunityRow = typeof opportunities.$inferSelect;
export type InformationSnippetRow = typeof informationSnippets.$inferSelect;
export type MissionResultRow = typeof missionResults.$inferSelect;
