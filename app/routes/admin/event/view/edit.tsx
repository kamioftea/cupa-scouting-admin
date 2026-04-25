import type {Route} from './+types/edit'
import {Link, redirect, useFetcher, useRouteLoaderData} from "react-router";
import Input from "app/components/form/Input";
import DateInput from "app/components/form/DateInput";
import {databaseContext} from "app/context/databaseContext.server";
import type {EventRow} from "app/model/drizzle/schema/logistics";
import TextArea from "app/components/form/TextArea";
import {appendToParentTitle} from "app/utils/routing";
import {eventValidator} from "app/model/drizzle/logistics.server";

export const meta = (args: Route.MetaArgs) => {
    return [appendToParentTitle('Edit', args)]
}

export function handle() {
    return {breadcrumb: 'Edit'};
}

export async function action({request, context, params}: Route.ActionArgs) {
    const {logisticsRepository} = context.get(databaseContext);
    const event = await logisticsRepository.findEventBySlug(params.eventSlug);

    const formData = Object.fromEntries(await request.formData());
    const eventUpdate = eventValidator.safeParse(formData);

    if (!eventUpdate.success) {
        return {errors: eventUpdate.error.issues};
    }

    await logisticsRepository.updateEvent(event!.eventId, eventUpdate.data);

    return redirect(`../../${eventUpdate.data.slug}`)
}

export default function AddEventPage({}: Route.ComponentProps) {
    const fetcher = useFetcher();
    const {event} = useRouteLoaderData("event") as {event: EventRow}

    return <>
        <h1>Add event</h1>
        <fetcher.Form method="post">
            <Input name={"name"} label="Name" defaultFocus errors={fetcher.data?.errors} defaultValue={event.name}/>
            <Input name={"slug"} label="Slug" errors={fetcher.data?.errors} defaultValue={event.slug}/>
            <DateInput name={"startDate"} label="Start date" errors={fetcher.data?.errors} defaultValue={event.startDate}/>
            <TextArea name={"description"} label="Description" errors={fetcher.data?.errors} defaultValue={event.description ?? undefined}/>

            <input className="button small primary" type="submit" value="Save changes"/>{' '}
            <Link to=".." className="button small secondary">Cancel</Link>
        </fetcher.Form>
    </>
}
