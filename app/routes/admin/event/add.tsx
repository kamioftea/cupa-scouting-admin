import type {Route} from "./+types/add";
import {Link, redirect, useFetcher} from "react-router";
import Input from "~/components/form/Input";
import DateInput from "~/components/form/DateInput";
import {databaseContext} from "~/context/databaseContext.server";
import TextArea from "~/components/form/TextArea";
import {eventValidator} from "~/model/drizzle/logistics.server";

export const meta = () => {
    return [
        {title: `Add event | Event | Admin | Curious Tales`},
    ];
}

export function handle() {
    return {breadcrumb: 'Add event'};
}

export async function action({request, context}: Route.ActionArgs) {
    const {logisticsRepository} = context.get(databaseContext);

    const formData = Object.fromEntries(await request.formData());
    const event = eventValidator.safeParse(formData);

    if (!event.success) {
        return {errors: event.error.issues};
    }

    await logisticsRepository.createEvent(event.data);

    return redirect(`../${event.data.slug}`)
}

export default function AddEventPage({}: Route.ComponentProps) {
    const fetcher = useFetcher();

    return <>
        <h1>Add event</h1>
        <fetcher.Form method="post">
            <Input name={"name"} label="Name" defaultFocus errors={fetcher.data?.errors}/>
            <Input name={"slug"} label="Slug" errors={fetcher.data?.errors}/>
            <DateInput name={"startDate"} label="Start date" errors={fetcher.data?.errors}/>
            <TextArea name={"description"} label="Description" errors={fetcher.data?.errors}/>

            <input className="button small primary" type="submit" value="Add event"/>{' '}
            <Link to=".." className="button small secondary">Cancel</Link>
        </fetcher.Form>
    </>
}
