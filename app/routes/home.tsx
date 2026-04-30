import type {Route} from "./+types/home";
import {databaseContext} from "~/context/databaseContext.server";
import {Link} from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "CuPa Scouting Admin"},
        {name: "description", content: "Manage scouting opportunities for Curious Pastimes events"},
    ];
}

export async function loader({context}: Route.LoaderArgs) {
    const {logisticsRepository} = context.get(databaseContext);
    const events = await logisticsRepository.findAllEvents();

    return {events};
}


export default function Home({loaderData}: Route.ComponentProps) {
    return <main id="main">
        <h1>CuPa Scouting</h1>
        <h2>Events</h2>
        <ul>
            {loaderData.events.map(
                ({slug, name}) =>
                    <li key={slug}>
                        <Link to={`./${slug}`}>{name}</Link>
                    </li>
            )}
        </ul>
        <h2>Metadata</h2>
        <ul>
            <li><Link to={'/stat-blocks'}>Stat blocks</Link></li>
            <li><Link to={'/npcs'}>NPCs</Link></li>
        </ul>
    </main>;
}
