import type {Route} from "./+types/add";
import {Link, redirect, useFetcher} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import {appendToParentTitle} from "~/utils/routing";
import {difficultyLevels, opportunityTypes, threatLevels} from "~/model/drizzle/schema/scouting";
import {opportunityValidator} from "~/model/drizzle/scouting.server";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {OpportunityFormElements} from "./opportunityForm";

export const meta = (args: Route.MetaArgs) => {
    return [appendToParentTitle('Add', args)]
}

export function handle() {
    return {breadcrumb: 'Add'};
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

    const formData = await request.formData();
    const data = {
        ...Object.fromEntries(formData),
        usefulSkills:
            (formData.getAll("usefulSkills") ?? [])
            .filter(skill => typeof skill === 'string' && skill.trim() !== ""),
        requirements:
            (formData.getAll("requirements") ?? [])
            .filter(req => typeof req === 'string' && req.trim() !== ""),
    }

    const opportunity = opportunityValidator.safeParse(data);

    if (!opportunity.success) {
        return {errors: opportunity.error.issues};
    }

    const id = await scoutingRepository.insertOpportunity({...opportunity.data, eventId});

    return redirect(`../${id}`);
}

export default function AddOpportunityPage({loaderData}: Route.ComponentProps) {
    const fetcher = useFetcher();

    return <>
        <h1>Add opportunity</h1>
        <fetcher.Form method="post">
            <OpportunityFormElements
                opportunityTypes={loaderData.opportunityTypes}
                difficultyLevels={loaderData.difficultyLevels}
                threatLevels={loaderData.threatLevels}
                errors={fetcher.data?.errors}
            />

            <input className="button small primary" type="submit" value="Add opportunity"/>{" "}
            <Link to=".." className="button small secondary">Cancel</Link>
        </fetcher.Form>
    </>
}
