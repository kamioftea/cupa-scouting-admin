import type {Route} from "./+types/print";
import {databaseContext} from "~/context/databaseContext.server";
import ReactMarkdown from "react-markdown";

import "../../../styles/print.scss"
import {authorised} from "~/context/authContext";
import {RoleValue} from "~/model/user.types";
import type {EncounterRow} from "~/model/drizzle/schema/metadata";

export async function loader({request, context, params}: Route.LoaderArgs) {
  authorised(request, context, [RoleValue.Organiser, RoleValue.Writer, RoleValue.Crew])
  const {logisticsRepository, metadataRepository} = context.get(databaseContext);
  const event = await logisticsRepository.findEventBySlug(params.eventSlug)
  
  if (!event) {
    return new Response("Event not found", {status: 404})
  }
  
  const url = new URL(request.url);
  const codes = url.searchParams.get("codes")?.split(',')
  
  const allEncounters: EncounterRow[] = await metadataRepository.findEncounterOpportunitiesByEvent(event.eventId);
  const encounters =
    codes
    ? codes
      .map(c => allEncounters.find(({code}) => code === c))
      .filter(opp => opp != null)
    : allEncounters;
  
  return {event, encounters};
}

export default function PrintOpportunitiesPage({loaderData: {encounters, event}}: Route.ComponentProps) {
  return <div className="opportunity-cards">
    {encounters.map(
      (enc) =>
        <div className="opportunity-card" key={enc.encounterId}>
          <img className="cp-glyph" src="/images/favicon.png" alt=""/>
          <div className="opportunity-subheader">Encounter Opportunity</div>
          <div className="opportunity-code">
            <small className="text-secondary">{event.slug.replace('-', '').toLocaleUpperCase()}</small>
            {enc.code}
          </div>
          <h2 className={`opportunity-name`}>{enc.name}</h2>
          <div className={`opportunity-description`}>
            <ReactMarkdown>{enc.playerDescription}</ReactMarkdown>
          </div>
          {enc.usefulSkills.length > 0
           ? <div className={`opportunity-useful-skills`}>{enc.usefulSkills.join(', ')}</div>
           : null
          }
          {enc.requirements.length > 0
           ? <div className={`opportunity-requirements`}>{enc.requirements.join(', ')}</div>
           : null
          }
        </div>
    )}
  </div>
}
