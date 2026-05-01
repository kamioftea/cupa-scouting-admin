import type {Route} from "./+types/print";
import {databaseContext} from "~/context/databaseContext.server";
import {displayEnum} from "~/utils/text";
import ReactMarkdown from "react-markdown";

import "./print.scss"
import {authorised} from "~/context/authContext";
import {RoleValue} from "~/model/user.types";
import type {OpportunityRow} from "~/model/drizzle/schema/scouting";

export async function loader({request, context, params}: Route.LoaderArgs) {
    authorised(request, context, [RoleValue.Organiser, RoleValue.Writer, RoleValue.Crew])
    const {logisticsRepository, scoutingRepository} = context.get(databaseContext);
    const event = await logisticsRepository.findEventBySlug(params.eventSlug)

    if (!event) {
        return new Response("Event not found", {status: 404})
    }

    const url = new URL(request.url);
    const codes = url.searchParams.get("codes")?.split(',')

    const allOpportunities: OpportunityRow[] = await scoutingRepository.findOpportunitiesByEvent(event.eventId);
    const opportunities =
        codes
        ? codes.map(c => allOpportunities.find(({code}) => code === c))
               .filter(opp => opp != null)
        : allOpportunities;

    return {event, opportunities};
}

export default function PrintOpportunitiesPage({loaderData: {opportunities, event}}: Route.ComponentProps) {
    return <div className="opportunity-cards">
        {opportunities.map(
            (op) =>
                <div className="opportunity-card" key={op.opportunityId}>
                    <img className="cp-glyph" src="/images/favicon.png" alt=""/>
                    <div className="opportunity-subheader">Scouting Opportunity</div>
                    <div className="opportunity-code">
                        <small className="text-secondary">{event.slug.replace('-', '').toLocaleUpperCase()}</small>
                        {op.code}
                    </div>
                    <h2 className={`opportunity-name`}>{op.name}</h2>
                    <div
                        className={`opportunity-type`}>{displayEnum(op.opportunityType)} ({displayEnum(op.difficultyLevel)})
                    </div>
                    <div className={`opportunity-threat`}>{displayEnum(op.threatLevel)}</div>
                    <div className={`opportunity-description`}>
                        <ReactMarkdown>{op.playerDescription}</ReactMarkdown>
                    </div>
                    {op.usefulSkills.length > 0
                     ? <div className={`opportunity-useful-skills`}>{op.usefulSkills.join(', ')}</div>
                     : null
                    }
                    {op.requirements.length > 0
                     ? <div className={`opportunity-requirements`}>{op.requirements.join(', ')}</div>
                     : null
                    }
                </div>
        )}
    </div>
}
