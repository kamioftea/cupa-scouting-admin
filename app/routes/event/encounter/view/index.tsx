import ListOrNone from "~/components/ListOrNone";
import ReactMarkdown from "react-markdown";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import type {EncounterRow} from "~/model/drizzle/schema/metadata";
import {Link, useRouteLoaderData} from "react-router";
import {FiCopy, FiEdit} from "react-icons/fi";

export default function () {
  const {encounter} = useRouteLoaderData("encounter") as { encounter: EncounterRow };
  const {event} = useRouteLoaderData("event") as { event: EventRow };
  
  return <>
    <div className='button-group float-right small'>
      <form method='post' action='?index'>
        <button className='button info' type='submit' name='action' value='duplicate'><FiCopy /> Duplicate</button>
      </form>
      <Link to={'./edit'} className="button primary small float-right"><FiEdit/> Edit Encounter</Link>
    </div><span className="text-secondary text-uppercase small">{event.name}</span>
    <h1>
      {encounter.code} - {encounter.name}
    </h1>
    <dl>
      <dt>Player description</dt>
      <dd><ReactMarkdown>{encounter.playerDescription || '_None_'}</ReactMarkdown></dd>
      
      <dt>Useful skills</dt>
      <dd><ListOrNone values={encounter.usefulSkills}/></dd>
      
      <dt>Requirements</dt>
      <dd><ListOrNone values={encounter.requirements}/></dd>
    </dl>
  </>
}
