import type {Route} from './+types/layout';
import {Outlet} from 'react-router';
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {databaseContext} from "~/context/databaseContext.server";
import {appendToParentTitle} from "~/utils/routing";

export const middleware: Route.MiddlewareFunction[] = [
  async ({context, params}) => {
    const {putEntity} = context.get(routeEntitiesContext);
    const {metadataRepository} = context.get(databaseContext);
    
    const encounterId = Number(params.encounterId);
    if(isNaN(encounterId)) {
      return new Response("Encounter ID must be a number", {status: 400})
    }
    
    const encounter = await metadataRepository.findEncounter(encounterId);
    if (!encounter) {
      return new Response("Encounter not found", {status: 404})
    }
    
    putEntity("encounter", encounter);
  }
];

export const meta = (args: Route.MetaArgs) => {
  return [appendToParentTitle(args.loaderData.encounter.name, args)]
}

export function handle({loaderData}: { loaderData: Route.ComponentProps['loaderData'] }) {
  return {
    breadcrumb: `${loaderData.encounter.name}`
  };
}

export async function loader({context}: Route.LoaderArgs) {
  const {getEntity} = context.get(routeEntitiesContext);
  
  return {encounter: getEntity("encounter")};
}

export default function EncounterLayout() {
  return <><Outlet/></>
}
