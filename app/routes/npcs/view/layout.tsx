import type {Route} from './+types/layout';
import {Outlet} from 'react-router';
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {databaseContext} from "~/context/databaseContext.server";
import {appendToParentTitle} from "~/utils/routing";
import type {NPCRow} from "~/model/drizzle/schema/metadata";

export const middleware: Route.MiddlewareFunction[] = [
    async ({context, params}) => {
        const {putEntity} = context.get(routeEntitiesContext);
        const {metadataRepository} = context.get(databaseContext);

        const npcId = Number(params.npcId);
        if(isNaN(npcId)) {
            return new Response("Stat block id must be a number", {status: 400})
        }

        const npc = await metadataRepository.findNPC(npcId);
        if (!npc) {
            return new Response("NPC not found", {status: 404})
        }

        putEntity("npc", npc);
    }
];

export const meta = (args: Route.MetaArgs) => {
    return [appendToParentTitle(args.loaderData.npc.name, args)]
}

export function handle({loaderData}: { loaderData: { npc: NPCRow } }) {
    return {
        breadcrumb: `${loaderData.npc.name}`
    };
}

export async function loader({context}: Route.LoaderArgs) {
    const {getEntity} = context.get(routeEntitiesContext);

    return {npc: getEntity("npc")};
}

export default function OpportunityLayout() {
    return <><Outlet/></>
}
