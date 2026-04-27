import {type RouterContextProvider} from "react-router";
import type {Database} from "~/context/drizzleContext";
import {drizzleContext} from "~/context/drizzleContext";
import {
    difficultyLevels,
    opportunities,
    type OpportunityRow,
    opportunityTypes,
    threatLevels
} from "~/model/drizzle/schema/scouting";
import {eq} from "drizzle-orm";
import {string, z} from "zod";

export class DrizzleScoutingRepository {
    private readonly db: Database;

    constructor(context: Readonly<RouterContextProvider>) {
        this.db = context.get(drizzleContext);
    }

    async findOpportunitiesByEvent(eventId: number): Promise<OpportunityRow[]> {
        return this.db.select().from(opportunities).where(eq(opportunities.eventId, eventId));
    }

    async findOpportunity(opportunityId: number): Promise<OpportunityRow | undefined> {
        return this.db
                   .select()
                   .from(opportunities)
                   .where(eq(opportunities.opportunityId, opportunityId))
                   .get();
    }

    async insertOpportunity(opportunity: Omit<OpportunityRow, 'opportunityId'>): Promise<number> {
        const {opportunityId} = await
            this.db
                .insert(opportunities)
                .values(opportunity)
                .returning({opportunityId: opportunities.opportunityId})
                .get()

        return opportunityId;
    }

    async updateOpportunity(opportunityId: number, opportunity: Omit<OpportunityRow, 'opportunityId'>): Promise<void> {
        await
            this.db
                .update(opportunities)
                .set(opportunity)
                .where(eq(opportunities.opportunityId, opportunityId))
    }
}

export const opportunityValidator: z.Schema<Omit<OpportunityRow, 'opportunityId' | 'eventId'>> = z.object(
    {
        name: z.string("Enter a name").min(1, "Enter a name"),
        opportunityType: z.enum(opportunityTypes, 'Select the type'),
        difficultyLevel: z.enum(difficultyLevels, 'Select the difficulty'),
        threatLevel: z.enum(threatLevels, 'Select the threat'),
        playerDescription: string().nullable().default(null),
        usefulSkills: z.array(z.string()).default([]),
        requirements: z.array(z.string()).default([]),
        monsterBriefing: string().nullable().default(null),
        expectedResult: string().nullable().default(null),
    }
);
