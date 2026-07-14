import type {Route} from "./+types/add";
import {Link, redirect, useFetcher, useRouteLoaderData} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import {appendToParentTitle} from "~/utils/routing";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import {EncounterFormElements, validateEncounterData} from "~/routes/event/encounter/components/EncounterForm";

export const meta = (args: Route.MetaArgs) => {
  return [appendToParentTitle('Add', args)]
}

export function handle() {
  return {breadcrumb: 'Add'};
}

export async function action({request, context}: Route.ActionArgs) {
  const {metadataRepository} = context.get(databaseContext);
  const {getEntity} = context.get(routeEntitiesContext);
  
  const {eventId} = getEntity('event');
  
  const formData = await request.formData();
  const encounter = validateEncounterData(formData);
  
  if (!encounter.success) {
    return {errors: encounter.error.issues};
  }
  
  const id = await metadataRepository.insertEncounter({...encounter.data, eventId});
  
  return redirect(`../${id}`);
}

export default function AddEncounterPage() {
  const {event} = useRouteLoaderData("event") as {event: EventRow};
  const fetcher = useFetcher();
  
  return <>
    <span className='text-secondary text-uppercase small'>{event.name}</span>
    <h1>Add encounter</h1>
    <fetcher.Form method="post">
      <EncounterFormElements errors={fetcher.data?.errors} />
      
      <input className="button small primary" type="submit" value="Add encounter"/>{" "}
      <Link to=".." className="button small secondary">Cancel</Link>
    </fetcher.Form>
  </>
}
