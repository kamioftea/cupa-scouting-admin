import {Link, useRouteLoaderData} from "react-router";
import type {OpportunityRow} from "~/model/drizzle/schema/scouting";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import {displayEnum} from "~/utils/text";
import ReactMarkdown from "react-markdown";
import type {ReactNode} from "react";
import {FiEdit} from "react-icons/fi";

function listOrNone(values?: string[]): ReactNode {
    const normalised = (values ?? []).filter(v => v.trim() !== '');

    return normalised.length > 0
    ? normalised.join(', ')
    : <em>None</em>
}

export default function (){
    const {opportunity} = useRouteLoaderData("opportunity") as {opportunity: OpportunityRow};
    const {event} = useRouteLoaderData("event") as {event: EventRow};

    return <>
        <Link to={'./edit'} className='button primary small float-right'><FiEdit /> Edit details</Link>
        <span className='text-secondary text-uppercase small'>{event.name}</span>
        <h1>
            {opportunity.name}
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
            <dd>{listOrNone(opportunity.usefulSkills)}</dd>

            <dt>Requirements</dt>
            <dd>{listOrNone(opportunity.requirements)}</dd>

            <dt>Monster briefing</dt>
            <dd><ReactMarkdown>{opportunity.monsterBriefing || '_None_'}</ReactMarkdown></dd>

            <dt>Expected result</dt>
            <dd><ReactMarkdown>{opportunity.expectedResult || '_None_'}</ReactMarkdown></dd>
        </dl>
    </>
}
