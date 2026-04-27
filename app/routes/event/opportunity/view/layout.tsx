import type {Route} from './+types/layout';
import {Outlet} from 'react-router';
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {databaseContext} from "~/context/databaseContext.server";
import {appendToParentTitle} from "~/utils/routing";

export const middleware: Route.MiddlewareFunction[] = [
    async ({context, params}) => {
        const {putEntity} = context.get(routeEntitiesContext);
        const {scoutingRepository} = context.get(databaseContext);

        const opportunityId = Number(params.opportunityId);
        if(isNaN(opportunityId)) {
            return new Response("Opportunity ID must be a number", {status: 400})
        }

        const opportunity = await scoutingRepository.findOpportunity(opportunityId);
        if (!opportunity) {
            return new Response("Opportunity not found", {status: 404})
        }

        putEntity("opportunity", opportunity);
    }
];

export const meta = (args: Route.MetaArgs) => {
    return [appendToParentTitle(args.loaderData.opportunity.name, args)]
}

export function handle({loaderData}: { loaderData: { opportunity: any } }) {
    return {
        breadcrumb: `${loaderData.opportunity.name}`
    };
}

export async function loader({context}: Route.LoaderArgs) {
    const {getEntity} = context.get(routeEntitiesContext);

    return {opportunity: getEntity("opportunity")};
}

export default function OpportunityLayout() {
    return <><Outlet/></>
}
