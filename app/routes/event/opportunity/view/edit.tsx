import type {Route} from "./+types/edit";
import {Link, redirect, useFetcher, useRouteLoaderData} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import {appendToParentTitle} from "~/utils/routing";
import {difficultyLevels, type OpportunityRow, opportunityTypes, threatLevels} from "~/model/drizzle/schema/scouting";
import {opportunityValidator} from "~/model/drizzle/scouting.server";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {OpportunityFormElements} from "../opportunityForm";
import type {EventRow} from "~/model/drizzle/schema/logistics";

export const meta = (args: Route.MetaArgs) => {
    return [appendToParentTitle('Edit', args)]
}

export function handle() {
    return {breadcrumb: 'Edit'};
}

export function loader() {
    return {
        opportunityTypes,
        difficultyLevels,
        threatLevels,
    }
}

export async function action({request, context}: Route.ActionArgs) {
    const {scoutingRepository} = context.get(databaseContext);
    const {getEntity} = context.get(routeEntitiesContext);

    const {eventId} = getEntity('event');
    const {opportunityId} = getEntity('opportunity');

    const formData = await request.formData();
    const data = {
        ...Object.fromEntries(formData),
        usefulSkills:
            (formData.getAll("usefulSkills") ?? [])
            .filter(skill => typeof skill === 'string' && skill.trim() !== ""),
        requirements:
            (formData.getAll("requirements") ?? [])
            .filter(req => typeof req === 'string' && req.trim() !== ""),
        items:
            (formData.getAll("items") ?? [])
            .filter(req => typeof req === 'string' && req.trim() !== ""),
    }

    const opportunity = opportunityValidator.safeParse(data);

    if (!opportunity.success) {
        return {errors: opportunity.error.issues};
    }

    await scoutingRepository.updateOpportunity(opportunityId, {...opportunity.data, eventId});

    return redirect(`..`);
}

export default function AddOpportunityPage({loaderData}: Route.ComponentProps) {
    const fetcher = useFetcher();
    const {event} = useRouteLoaderData("event") as {event: EventRow}
    const {opportunity} = useRouteLoaderData("opportunity") as {opportunity: OpportunityRow}

    return <>
        <span className='text-secondary text-uppercase small'>{event.name}</span>
        <h1>Edit {opportunity.name}</h1>
        <fetcher.Form method="post">
            <OpportunityFormElements
                opportunityTypes={loaderData.opportunityTypes}
                difficultyLevels={loaderData.difficultyLevels}
                threatLevels={loaderData.threatLevels}
                errors={fetcher.data?.errors}
                values={opportunity}
            />

            <input className="button small primary" type="submit" value="Save changes"/>{" "}
            <Link to=".." className="button small secondary">Cancel</Link>
        </fetcher.Form>
    </>
}
