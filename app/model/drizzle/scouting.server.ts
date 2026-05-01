import {type RouterContextProvider} from "react-router";
import type {Database} from "~/context/drizzleContext";
import {drizzleContext} from "~/context/drizzleContext";
import {
    difficultyLevels,
    type InformationSnippetRow,
    informationSnippets,
    opportunities, opportunityFollowUps, opportunityInformationSnippets, opportunityNPCs,
    type OpportunityRow, opportunityStatBlocks,
    opportunityTypes,
    threatLevels
} from "~/model/drizzle/schema/scouting";
import {and, eq, max, sql, inArray} from "drizzle-orm";
import {string, z} from "zod";
import dayjs from "dayjs";

export class DrizzleScoutingRepository {
    private readonly db: Database;

    constructor(context: Readonly<RouterContextProvider>) {
        this.db = context.get(drizzleContext);
    }

    async findOpportunitiesByEvent(eventId: number, codes?: string[]): Promise<OpportunityRow[]> {
        const where = (codes && codes.length > 0)
                      ? and(eq(opportunities.eventId, eventId), inArray(opportunities.code, codes))
                      : eq(opportunities.eventId, eventId);

        return this.db.select().from(opportunities).where(where);
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

        if (!maxCode?.maxCode) {
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

    async updateOpportunity(
        opportunityId: number,
        opportunity: Omit<OpportunityRow, 'opportunityId' | 'code'>
    ): Promise<void> {
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

    async getLinkedSnippetIds(opportunityId: number) {
        const linkedSnippets = await
            this.db
                .select({snippetId: opportunityInformationSnippets.snippetId})
                .from(opportunityInformationSnippets)
                .where(eq(opportunityInformationSnippets.opportunityId, opportunityId));

        return linkedSnippets.map(s => s.snippetId);
    }

    async linkSnippetToOpportunity(opportunityId: number, snippetId: number): Promise<void> {
        await this.db
                  .insert(opportunityInformationSnippets)
                  .values({opportunityId, snippetId})
                  .onConflictDoNothing();
    }

    async getLinkedStatBlockIds(opportunityId: number): Promise<number[]> {
        const linkedStatBlocks = await
            this.db
                .select({statBlockId: opportunityStatBlocks.statBlockId})
                .from(opportunityStatBlocks)
                .where(eq(opportunityStatBlocks.opportunityId, opportunityId));

        return linkedStatBlocks.map(s => s.statBlockId)
    }

    async linkStatBlockToOpportunity(opportunityId: number, statBlockId: number): Promise<void> {
        await this.db
                  .insert(opportunityStatBlocks)
                  .values({opportunityId, statBlockId})
                  .onConflictDoNothing();
    }

    async getLinkedNPCs(opportunityId: number): Promise<number[]> {
        const linkedNPCs = await
            this.db
                .select({npcId: opportunityNPCs.npcId})
                .from(opportunityNPCs)
                .where(eq(opportunityNPCs.opportunityId, opportunityId));

        return linkedNPCs.map(s => s.npcId)
    }

    async linkNPCToOpportunity(opportunityId: number, npcId: number): Promise<void> {
        await this.db
                  .insert(opportunityNPCs)
                  .values({opportunityId, npcId})
                  .onConflictDoNothing();
    }

    async getFollowUpOpportunityIds(opportunityId: number) {
        const followUpOpportunities = await
            this.db
                .select({unlockedId: opportunityFollowUps.unlockedOpportunityId})
                .from(opportunityFollowUps)
                .where(eq(opportunityFollowUps.sourceOpportunityId, opportunityId));

        return followUpOpportunities.map(s => s.unlockedId);
    }

    async getSourceOpportunityIds(opportunityId: number) {
        const sourceOpportunities = await
            this.db
                .select({sourceId: opportunityFollowUps.sourceOpportunityId})
                .from(opportunityFollowUps)
                .where(eq(opportunityFollowUps.unlockedOpportunityId, opportunityId));

        return sourceOpportunities.map(s => s.sourceId);
    }

    async linkOpportunities(sourceOpportunityId: number, unlockedOpportunityId: number) {
        await this.db
                  .insert(opportunityFollowUps)
                  .values({sourceOpportunityId, unlockedOpportunityId})
                  .onConflictDoNothing();
    }

    async duplicateOpportunity(opportunity: OpportunityRow) {
        const data: Omit<OpportunityRow, 'opportunityId'> & { opportunityId?: number } = {
            ...opportunity,
            name: `Copy of ${opportunity.name}`,
            code: await this.getNextCode(opportunity.eventId)
        }

        delete data.opportunityId;

        const res = await
            this.db.insert(opportunities)
                .values(data)
                .returning({opportunityId: opportunities.opportunityId})
                .get();

        const newId = res.opportunityId;

        await this.db
                  .insert(opportunityInformationSnippets)
                  .select(
                      this.db
                          .select(
                              {
                                  opportunityId: sql<number>`${newId}`.as("opportunityId"),
                                  snippetId: opportunityInformationSnippets.snippetId
                              }
                          )
                          .from(opportunityInformationSnippets)
                          .where(eq(opportunityInformationSnippets.opportunityId, opportunity.opportunityId))
                  );

        await this.db
                  .insert(opportunityStatBlocks)
                  .select(
                      this.db
                          .select(
                              {
                                  opportunityId: sql<number>`${newId}`.as("opportunityId"),
                                  statBlockId: opportunityStatBlocks.statBlockId
                              }
                          )
                          .from(opportunityStatBlocks)
                          .where(eq(opportunityStatBlocks.opportunityId, opportunity.opportunityId))
                  );

        await this.db
                  .insert(opportunityNPCs)
                  .select(
                      this.db
                          .select(
                              {
                                  opportunityId: sql<number>`${newId}`.as("opportunityId"),
                                  npcId: opportunityNPCs.npcId
                              }
                          )
                          .from(opportunityNPCs)
                          .where(eq(opportunityNPCs.opportunityId, opportunity.opportunityId))
                  );

        return newId;
    }

    async toggleDone(snippetId: number) {
        const snippet = await
            this.db.query
                .informationSnippets
                .findFirst(
                    {
                        where: eq(informationSnippets.snippetId, snippetId)
                    }
                );

        if(!snippet) {
            return
        }

        const done = snippet.done == null
            ? dayjs().toISOString()
            : null;

        await this.db.update(informationSnippets).set({done}).where(eq(informationSnippets.snippetId, snippetId));
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
