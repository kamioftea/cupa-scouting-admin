import type {Route} from "./+types/edit";
import {Link, redirect, useFetcher, useRouteLoaderData} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import {appendToParentTitle} from "~/utils/routing";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import type {EncounterRow} from "~/model/drizzle/schema/metadata";
import {EncounterFormElements, validateEncounterData} from "~/routes/event/encounter/components/EncounterForm";

export const meta = (args: Route.MetaArgs) => {
  return [appendToParentTitle('Edit', args)]
}

export function handle() {
  return {breadcrumb: 'Edit'};
}

export async function action({request, context}: Route.ActionArgs) {
  const {metadataRepository} = context.get(databaseContext);
  const {getEntity} = context.get(routeEntitiesContext);
  
  const {eventId} = getEntity('event');
  const {encounterId} = getEntity('encounter');
  
  const formData = await request.formData();
  const encounter = validateEncounterData(formData);
  
  if (!encounter.success) {
    return {errors: encounter.error.issues};
  }
  
  await metadataRepository.updateEncounter(encounterId, {...encounter.data, eventId});
  
  return redirect(`..`);
}

export default function EditOpportunityPage() {
  const fetcher = useFetcher();
  const {event} = useRouteLoaderData("event") as {event: EventRow}
  const {encounter} = useRouteLoaderData("encounter") as {encounter: EncounterRow}
  
  return <>
    <span className='text-secondary text-uppercase small'>{event.name}</span>
    <h1>Edit {encounter.name}</h1>
    <fetcher.Form method="post">
      <EncounterFormElements
        errors={fetcher.data?.errors}
        values={encounter}
      />
      
      <input className="button small primary" type="submit" value="Save changes"/>{" "}
      <Link to=".." className="button small secondary">Cancel</Link>
    </fetcher.Form>
  </>
}
