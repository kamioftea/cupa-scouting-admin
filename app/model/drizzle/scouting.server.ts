import {type RouterContextProvider} from "react-router";
import type {Database} from "~/context/drizzleContext";
import {drizzleContext} from "~/context/drizzleContext";
import {
    difficultyLevels,
    type InformationSnippetRow,
    informationSnippets,
    opportunities,
    type OpportunityRow,
    opportunityTypes,
    threatLevels
} from "~/model/drizzle/schema/scouting";
import {eq, max} from "drizzle-orm";
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

    async getNextCode(eventId: number): Promise<string> {
        const maxCode = await this.db
                                  .select({
                                      maxCode: max(opportunities.code),
                                  })
                                  .from(opportunities)
                                  .where(eq(opportunities.eventId, eventId))
                                  .get();

        if(!maxCode?.maxCode) {
            return 'S001';
        }

        const maxNumber = Number(maxCode.maxCode.match(/^S0*([1-9]\d*)$/)?.[1] ?? '0')

        return `S${String(maxNumber + 1).padStart(3, '0')}`;
    }

    async insertOpportunity(opportunity: Omit<OpportunityRow, 'opportunityId' | 'code'>): Promise<number> {
        const code = await this.getNextCode(opportunity.eventId);

        const {opportunityId} = await
            this.db
                .insert(opportunities)
                .values({...opportunity, code: code})
                .returning({opportunityId: opportunities.opportunityId})
                .get()

        return opportunityId;
    }

    async updateOpportunity(opportunityId: number, opportunity: Omit<OpportunityRow, 'opportunityId' | 'code'>): Promise<void> {
        await
            this.db
                .update(opportunities)
                .set(opportunity)
                .where(eq(opportunities.opportunityId, opportunityId))
    }

    async getSnippetsByEvent(eventId: number): Promise<InformationSnippetRow[]> {
        return this.db.select().from(informationSnippets).where(eq(informationSnippets.eventId, eventId));
    }

    async addSnippet(eventId: number, content: string) {
        const {snippetId} =
            await this.db.insert(informationSnippets)
                      .values({eventId, content})
                      .returning({snippetId: informationSnippets.snippetId})
                      .get();

        return snippetId;
    }

    async updateSnippet(snippetId: number, content: string) {
        await this.db.update(informationSnippets).set({content}).where(eq(informationSnippets.snippetId, snippetId));
    }

    async deleteSnippet(snippetId: number) {
        await this.db.delete(informationSnippets).where(eq(informationSnippets.snippetId, snippetId));
    }
}

export const opportunityValidator: z.Schema<Omit<OpportunityRow, 'opportunityId' | 'eventId' | 'code'>> = z.object(
    {
        name: z.string("Enter a name").min(1, "Enter a name"),
        opportunityType: z.enum(opportunityTypes, 'Select the type'),
        difficultyLevel: z.enum(difficultyLevels, 'Select the difficulty'),
        threatLevel: z.enum(threatLevels, 'Select the threat'),
        playerDescription: string().nullable().default(null),
        usefulSkills: z.array(z.string()).default([]),
        requirements: z.array(z.string()).default([]),
        items: z.array(z.string()).default([]),
        monsterBriefing: string().nullable().default(null),
        expectedResult: string().nullable().default(null),
    }
);
