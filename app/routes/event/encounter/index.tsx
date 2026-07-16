import type {Route} from './+types/index';
import {Link, useRouteLoaderData} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import {FiCheck, FiPlus, FiPrinter} from "react-icons/fi";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import type {EventRow} from "~/model/drizzle/schema/logistics";

export async function loader({context}: Route.LoaderArgs) {
  const { getEntity } = context.get(routeEntitiesContext);
  const { metadataRepository } = context.get(databaseContext);
  
  return {
    encounters: await metadataRepository.findEncountersByEvent(getEntity('event').eventId),
  };
}

export default function EncountersPage({loaderData: {encounters}}: Route.ComponentProps) {
  const {event} = useRouteLoaderData("event") as {event: EventRow};
  
  return <>
    <div className='button-group small float-right'>
      <Link to={'./print'} className='button info'><FiPrinter /> Print</Link>
      <Link to={'./add'} className='button primary'><FiPlus /> Add encounter</Link>
    </div>
    <span className='text-secondary text-uppercase small'>{event.name}</span>
    <h2>Encounters</h2>
    <table className='hover'>
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Opportunity?</th>
        </tr>
      </thead>
      <tbody>
        {encounters.map(
          ({encounterId, code, name, produceEncounterOpportunity}) =>
            <tr key={encounterId}>
              <td><Link to={`./${encounterId}`}>{code}</Link></td>
              <td>{name}</td>
              <td>{produceEncounterOpportunity ? <FiCheck /> : <>&times;</>}</td>
            </tr>
        )}
      </tbody>
    </table>
  </>
}
