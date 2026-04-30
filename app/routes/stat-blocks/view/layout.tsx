import type {Route} from './+types/layout';
import {Outlet} from 'react-router';
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {databaseContext} from "~/context/databaseContext.server";
import {appendToParentTitle} from "~/utils/routing";
import type {StatBlockRow} from "~/model/drizzle/schema/metadata";

export const middleware: Route.MiddlewareFunction[] = [
    async ({context, params}) => {
        const {putEntity} = context.get(routeEntitiesContext);
        const {metadataRepository} = context.get(databaseContext);

        const statBlockId = Number(params.statBlockId);
        if(isNaN(statBlockId)) {
            return new Response("Stat block id must be a number", {status: 400})
        }

        const statBlock = await metadataRepository.findStatBlock(statBlockId);
        if (!statBlock) {
            return new Response("Stat Block not found", {status: 404})
        }

        putEntity("statBlock", statBlock);
    }
];

export const meta = (args: Route.MetaArgs) => {
    return [appendToParentTitle(args.loaderData.statBlock.name, args)]
}

export function handle({loaderData}: { loaderData: { statBlock: StatBlockRow } }) {
    return {
        breadcrumb: `${loaderData.statBlock.name}`
    };
}

export async function loader({context}: Route.LoaderArgs) {
    const {getEntity} = context.get(routeEntitiesContext);

    return {statBlock: getEntity("statBlock")};
}

export default function OpportunityLayout() {
    return <><Outlet/></>
}
