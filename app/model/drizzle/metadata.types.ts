import type {EncounterRow} from "~/model/drizzle/schema/metadata";
import {z} from "zod";

export const encounterValidator: z.Schema<Omit<EncounterRow, 'encounterId' | 'eventId'>> = z.object(
  {
    name: z.string("Enter a name").min(1, "Enter a name"),
    code: z.string("Enter a code").min(1, "Enter a code"),
    produceEncounterOpportunity: z.stringbool(),
    playerDescription: z.string().nullable().default(null),
    usefulSkills: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
  }
);
