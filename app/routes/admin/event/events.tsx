import type {Route} from './+types/events';
import {Link} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import dayjs from "dayjs";
import {FiPlus} from "react-icons/fi";


export async function loader({context}: Route.LoaderArgs) {
    const { logisticsRepository } = context.get(databaseContext);

    return {
        events: await logisticsRepository.findAllEvents(),
    };
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Events | Admin | Curious Tales`},
    ];
}

export default function EventsPage({loaderData: {events}}: Route.ComponentProps) {
    return <>
        <Link to={'./add'} className='button small primary float-right'><FiPlus /> Add event</Link>
        <h2>Events</h2>
        <table className='hover'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Start</th>
                </tr>
            </thead>
            <tbody>
                {events.map(
                    ({eventId, name, slug, startDate}) =>
                        <tr key={eventId}>
                            <td><Link to={`/admin/events/${slug}`}>{name}</Link></td>
                            <td><code>{slug}</code></td>
                            <td>{dayjs(startDate).format('D MMM YYYY')}</td>
                        </tr>
                )}
            </tbody>
        </table>
    </>
}
