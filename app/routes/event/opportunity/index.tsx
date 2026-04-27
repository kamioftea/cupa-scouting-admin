import type {Route} from './+types/index';
import {Link} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import {FiPlus} from "react-icons/fi";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";

export async function loader({context}: Route.LoaderArgs) {
    const {getEntity} = context.get(routeEntitiesContext);
    const { scoutingRepository } = context.get(databaseContext);

    return {
        opportunities: await scoutingRepository.findOpportunitiesByEvent(getEntity('event').eventId),
    };
}

export default function EventsPage({loaderData: {opportunities}}: Route.ComponentProps) {
    return <>
        <Link to={'./add'} className='button small primary float-right'><FiPlus /> Add opportunity</Link>
        <h2>Opportunities</h2>
        <table className='hover'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Threat</th>
                </tr>
            </thead>
            <tbody>
                {opportunities.map(
                    ({opportunityId, name, opportunityType, difficultyLevel, threatLevel}) =>
                        <tr key={opportunityId}>
                            <td><Link to={`./${opportunityId}`}>{name}</Link></td>
                            <td>{opportunityType} ({difficultyLevel})</td>
                            <td>{threatLevel}</td>
                        </tr>
                )}
            </tbody>
        </table>
    </>
}
