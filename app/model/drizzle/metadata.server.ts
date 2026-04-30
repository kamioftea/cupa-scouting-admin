import {type RouterContextProvider} from "react-router";
import type {Database} from "~/context/drizzleContext";
import {drizzleContext} from "~/context/drizzleContext";
import {eq} from "drizzle-orm";
import {type NPCRow, npcs, type StatBlockRow, statBlocks} from "~/model/drizzle/schema/metadata";

export class DrizzleMetadataRepository {
    private readonly db: Database;

    constructor(context: Readonly<RouterContextProvider>) {
        this.db = context.get(drizzleContext);
    }

    async findAllStatBlocks(): Promise<StatBlockRow[]> {
        return this.db.select().from(statBlocks);
    }

    async findStatBlock(statBlockId: number): Promise<StatBlockRow | undefined> {
        return this.db
                   .select()
                   .from(statBlocks)
                   .where(eq(statBlocks.statBlockId, statBlockId))
                   .get();
    }

    async findAllNPCs(): Promise<(NPCRow & { statBlock: StatBlockRow | null })[]> {
        return this.db.query.npcs.findMany(
            {
                with: {statBlock: true}
            }
        );
    }

    async findNPC(npcId: number): Promise<(NPCRow & { statBlock: StatBlockRow | null }) | undefined> {
        return this.db.query.npcs.findFirst(
            {
                with: {statBlock: true},
                where: eq(npcs.npcId, npcId)
            }
        );
    }

    async createStatBlock(name: string): Promise<number> {
        return (
            await this.db
                      .insert(statBlocks)
                      .values({name})
                      .returning({statBlockId: statBlocks.statBlockId})
                      .get())
            .statBlockId;
    }

    async updateStatBlock(statBlockId: number, data: Partial<Omit<StatBlockRow, "statBlockId">>): Promise<void> {
        await this.db
                  .update(statBlocks)
                  .set(data)
                  .where(eq(statBlocks.statBlockId, statBlockId));

    }

    async createNPC(name: string): Promise<number> {
        return (
            await this.db
                      .insert(npcs)
                      .values({name})
                      .returning({npcId: npcs.npcId})
                      .get())
            .npcId;
    }

    async updateNPC(npcId: number, data: Partial<NPCRow>): Promise<void> {
        await this.db
                  .update(npcs)
                  .set(data)
                  .where(eq(npcs.npcId, npcId));

    }

    async duplicateStatBlock(statBlock: StatBlockRow): Promise<number> {
        const data: Omit<StatBlockRow, 'statBlockId'> & {statBlockId?: number} = {
            ...statBlock,
            name: `Copy of ${statBlock.name}`,
        }

        delete data.statBlockId;

        const res = await this.db.insert(statBlocks)
                              .values(data)
                              .returning({statBlockId: statBlocks.statBlockId})
                              .get();

        return res.statBlockId;
    }
}
