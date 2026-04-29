import type {Route} from './+types/index';
import {Link, useRouteLoaderData} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import {FiPlus, FiPrinter} from "react-icons/fi";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {displayEnum} from "~/utils/text";
import type {EventRow} from "~/model/drizzle/schema/logistics";

export async function loader({context}: Route.LoaderArgs) {
    const {getEntity} = context.get(routeEntitiesContext);
    const { scoutingRepository } = context.get(databaseContext);

    return {
        opportunities: await scoutingRepository.findOpportunitiesByEvent(getEntity('event').eventId),
    };
}

export default function OpportunitiesPage({loaderData: {opportunities}}: Route.ComponentProps) {
    const {event} = useRouteLoaderData("event") as {event: EventRow};

    return <>
        <div className='button-group small float-right'>
            <Link to={'./print'} className='button info'><FiPrinter /> Print</Link>
            <Link to={'./add'} className='button primary'><FiPlus /> Add opportunity</Link>
        </div>
        <span className='text-secondary text-uppercase small'>{event.name}</span>
        <h2>Opportunities</h2>
        <table className='hover'>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Threat</th>
                </tr>
            </thead>
            <tbody>
                {opportunities.map(
                    ({opportunityId, code, name, opportunityType, difficultyLevel, threatLevel}) =>
                        <tr key={opportunityId}>
                            <td><Link to={`./${opportunityId}`}>{code}</Link></td>
                            <td>{name}</td>
                            <td>{displayEnum(opportunityType)} ({displayEnum(difficultyLevel)})</td>
                            <td>{displayEnum(threatLevel)}</td>
                        </tr>
                )}
            </tbody>
        </table>
    </>
}
