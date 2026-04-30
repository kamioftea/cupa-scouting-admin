import {type RouterContextProvider} from "react-router";
import type {Database} from "~/context/drizzleContext";
import {drizzleContext} from "~/context/drizzleContext";
import {eq} from "drizzle-orm";
import {type StatBlockRow, statBlocks} from "~/model/drizzle/schema/metadata";

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

    async createStatBlock(name: string) {
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
}
