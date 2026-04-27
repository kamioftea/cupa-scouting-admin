import type {Route} from "./+types/layout";
import {Outlet} from "react-router";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import {databaseContext} from "~/context/databaseContext.server";

export async function loader({context, params}: Route.LoaderArgs) {
    const { logisticsRepository } = context.get(databaseContext);

    const event = await logisticsRepository.findEventBySlug(params.eventSlug);
    if(!event) {
        return new Response("Event not found", {status: 404})
    }

    return {event}
}

export const meta = ({loaderData}: Route.MetaArgs) => {
    return [
        {title: `${loaderData.event.name} | Events | Admin | CuPa Scouting`},
    ];
}

export function handle({loaderData}: {loaderData: {event: EventRow}}) {
    return {
        breadcrumb: `${loaderData.event.name}`
    };
}

export default function EventAdminLayout() {
    return <><Outlet /></>
}
