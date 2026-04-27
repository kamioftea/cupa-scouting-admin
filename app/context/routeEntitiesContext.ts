import type {EventRow} from "~/model/drizzle/schema/logistics";
import type {InformationSnippetRow, MissionResultRow, OpportunityRow} from "~/model/drizzle/schema/scouting";
import { createContext } from "react-router";
import {titleCase} from "~/utils/text";

type RouteEntities = {
    event?: EventRow
    opportunity?: OpportunityRow
    snippet?: InformationSnippetRow
    mission?: MissionResultRow
}

type RouteEntitiesContext = {
    putEntity<Key extends keyof RouteEntities>(key: Key, value: RouteEntities[Key]): void
    getEntity<Key extends keyof RouteEntities>(key: Key): NonNullable<RouteEntities[Key]>,
}

export const routeEntitiesContext = createContext<RouteEntitiesContext>();

export function createRouteEntitiesContext(): RouteEntitiesContext {
    const state: RouteEntities = {};

    return {
        putEntity(key, value) {
            state[key] = value;
        },
        getEntity(key) {
            const entity = state[key];

            if(!entity) {
                throw new Response(`${titleCase(key)} not found`, {status: 404});
            }

            return entity as NonNullable<RouteEntities[typeof key]>;
        },
    };
}
