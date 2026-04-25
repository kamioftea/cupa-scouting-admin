import {type RouterContextProvider} from "react-router";
import type {Database} from "~/context/drizzleContext";
import {drizzleContext} from "~/context/drizzleContext";
import {type EventRow, events} from "~/model/drizzle/schema/logistics";
import {desc, eq} from "drizzle-orm";
import {dateInputValidator} from "~/components/form/DateInput";
import {z} from "zod";

export class DrizzleLogisticsRepository {
    private readonly db: Database;

    constructor(context: Readonly<RouterContextProvider>) {
        this.db = context.get(drizzleContext);
    }

    async createEvent(request: Omit<EventRow, 'eventId'>): Promise<number> {
        const [{eventId}] = await
            this.db
                .insert(events)
                .values(request)
                .onConflictDoNothing()
                .returning({eventId: events.eventId});

        return eventId;
    }

    async updateEvent(eventId: number, request: Omit<EventRow, 'eventId'>): Promise<void> {
        await
            this.db
                .update(events)
                .set(request)
                .where(eq(events.eventId, eventId));
    }

    async findAllEvents(): Promise<EventRow[]> {
        return this.db.select().from(events).orderBy(desc(events.startDate));
    }

    async findEventBySlug(eventSlug: string): Promise<EventRow | undefined> {
        return this.db.select().from(events).where(eq(events.slug, eventSlug)).get();
    }
}

const startDateValidator = dateInputValidator<Omit<EventRow, 'eventId'>, "startDate">("startDate");

export const eventValidator =
    z.object(
        {
            name: z.string().min(1, "Enter an event name"),
            slug: z.string()
                   .min(1, "Enter an event slug")
                   .regex(
                       /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                       "Slug must be lowercase and can only contain letters, numbers and hyphens"
                   ),
            description: z.string().nullable(),
            ...startDateValidator.fieldValidators
        }
    ).superRefine((data, ctx) => {
        startDateValidator.refine(data, ctx);
    })
     .transform(data => startDateValidator.transform(data));
