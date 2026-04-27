import type {Route} from "./+types/layout";
import {Link, Outlet} from "react-router";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import Breadcrumbs from "~/components/Breadcrumbs";
import FlashMessageBanner from "~/components/FlashMessageBanner";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";

export const middleware: Route.MiddlewareFunction[] = [
    async ({context, params}) => {
        const {databaseContext} = await import("~/context/databaseContext.server");
        const {putEntity} = context.get(routeEntitiesContext);
        const {logisticsRepository} = context.get(databaseContext);

        const event = await logisticsRepository.findEventBySlug(params.eventSlug);
        if (!event) {
            return new Response("Event not found", {status: 404})
        }

        putEntity("event", event);
    }
];

export async function loader({context}: Route.LoaderArgs) {
    const {getEntity} = context.get(routeEntitiesContext);

    return {event: getEntity('event')}
}

export const meta = ({loaderData}: Route.MetaArgs) => {
    return [
        {title: `${loaderData.event.name} Scouting`},
    ];
}

export function handle({loaderData}: { loaderData: { event: EventRow } }) {
    return {
        breadcrumb: `${loaderData.event.name} Scouting`
    };
}

export default function EventLayout() {
    return <main id="main" className="wide">
        <Breadcrumbs/>
        <FlashMessageBanner/>
        <div className="split-two-thirds">
            <section><Outlet/></section>
            <nav aria-label="Admin navigation">
                <p><Link to={'./opportunity'}>Opportunities</Link></p>
                <p><Link to={'./snippet'}>Information Snippets</Link></p>
                <p><Link to={'./mission'}>Mission Results</Link></p>
            </nav>
        </div>
    </main>
}
