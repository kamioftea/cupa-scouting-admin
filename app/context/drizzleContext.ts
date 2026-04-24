import { createContext } from "react-router";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "~/model/drizzle/schema";

export type Database = DrizzleD1Database<typeof schema>;

export const drizzleContext = createContext<Database>();

export function createDrizzleContext(env: Env) {
  return drizzle(env.D1, { schema });
}

