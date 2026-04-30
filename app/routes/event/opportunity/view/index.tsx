import {Link, useRouteLoaderData} from "react-router";
import type {OpportunityRow} from "~/model/drizzle/schema/scouting";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import {displayEnum} from "~/utils/text";
import ReactMarkdown from "react-markdown";
import {FiEdit} from "react-icons/fi";
import ListOrNone from "~/components/ListOrNone";

export default function (){
    const {opportunity} = useRouteLoaderData("opportunity") as {opportunity: OpportunityRow};
    const {event} = useRouteLoaderData("event") as {event: EventRow};

    return <>
        <Link to={'./edit'} className='button primary small float-right'><FiEdit /> Edit details</Link>
        <span className='text-secondary text-uppercase small'>{event.name}</span>
        <h1>
            {opportunity.code} - {opportunity.name}
        </h1>
        <div className='rating-row'>
            <dl><dt>Type</dt><dd>{displayEnum(opportunity.opportunityType)}</dd></dl>
            <dl><dt>Difficulty</dt><dd>{displayEnum(opportunity.difficultyLevel)}</dd></dl>
            <dl><dt>Threat</dt><dd>{displayEnum(opportunity.threatLevel)}</dd></dl>
        </div>
        <dl>
            <dt>Player description</dt>
            <dd><ReactMarkdown>{opportunity.playerDescription || '_None_'}</ReactMarkdown></dd>

            <dt>Useful skills</dt>
            <dd><ListOrNone values={opportunity.usefulSkills} /></dd>

            <dt>Requirements</dt>
            <dd><ListOrNone values={opportunity.requirements} /></dd>

            <dt>Monster briefing</dt>
            <dd><ReactMarkdown>{opportunity.monsterBriefing || '_None_'}</ReactMarkdown></dd>

            <dt>Items/props</dt>
            <dd><ListOrNone values={opportunity.items} /></dd>

            <dt>Expected result</dt>
            <dd><ReactMarkdown>{opportunity.expectedResult || '_None_'}</ReactMarkdown></dd>
        </dl>
    </>
}
