import type {Route} from "./+types/index";
import {Link, redirect, useRouteLoaderData} from "react-router";
import type {OpportunityRow} from "~/model/drizzle/schema/scouting";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import {displayEnum} from "~/utils/text";
import ReactMarkdown from "react-markdown";
import {FiCopy, FiEdit} from "react-icons/fi";
import ListOrNone from "~/components/ListOrNone";
import {databaseContext} from "~/context/databaseContext.server";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {useState} from "react";
import Autocomplete from "~/components/Autocomplete";

export async function loader({context}: Route.LoaderArgs) {
    const {scoutingRepository, metadataRepository} = context.get(databaseContext);
    const event = context.get(routeEntitiesContext).getEntity("event");
    const opportunity = context.get(routeEntitiesContext).getEntity("opportunity");

    const followedByIds = await scoutingRepository.getFollowUpOpportunityIds(opportunity.opportunityId);
    const sourceIds = await scoutingRepository.getSourceOpportunityIds(opportunity.opportunityId);

    return {
        links: {
            statBlocks: {
                label: "Stat Block",
                options: (await metadataRepository.findAllStatBlocks())
                .map(({statBlockId, name}) => ({value: statBlockId, label: name})),
                selected: await scoutingRepository.getLinkedStatBlockIds(opportunity.opportunityId)
            },
            npcs: {
                label: "NPC",
                options: (await metadataRepository.findAllNPCs())
                .map(({npcId, name}) => ({value: npcId, label: name})),
                selected: await scoutingRepository.getLinkedNPCs(opportunity.opportunityId)
            },
            snippets: {
                label: "Information Snippet",
                options:
                    (await scoutingRepository.getSnippetsByEvent(event.eventId))
                    .map(({snippetId, content}) =>
                             ({value: snippetId, label: content})),
                selected: await scoutingRepository.getLinkedSnippetIds(opportunity.opportunityId)
            },
            followedBy: {
                label: "Follow up opportunity",
                header: "Follow up opportunities",
                options: (await scoutingRepository.findOpportunitiesByEvent(event.eventId))
                .filter(
                    ({opportunityId}) =>
                        opportunityId !== opportunity.opportunityId
                        && !sourceIds.includes(opportunityId)
                )
                .map(({opportunityId, code, name}) => ({value: opportunityId, label: `${code} - ${name}`})),
                selected: followedByIds
            },
            follows: {
                label: "Source opportunity",
                header: "Source opportunities",
                options: (await scoutingRepository.findOpportunitiesByEvent(event.eventId))
                .filter(
                    ({opportunityId}) =>
                        opportunityId !== opportunity.opportunityId
                        && !followedByIds.includes(opportunityId)
                )
                .map(({opportunityId, code, name}) => ({value: opportunityId, label: `${code} - ${name}`})),
                selected: sourceIds
            },
        }
    };
}

export async function action({request, context}: Route.ActionArgs) {
    const {scoutingRepository} = context.get(databaseContext);
    const {getEntity} = context.get(routeEntitiesContext);

    const opportunity = getEntity('opportunity');
    const opportunityId = opportunity.opportunityId

    const formData = await request.formData();
    const linkType = formData.get("linkType");
    const linkId = Number(formData.get("linkId"));
    const action = formData.get("action");

    if (action === "duplicate") {
        const id = await scoutingRepository.duplicateOpportunity(opportunity);
        return redirect(`../${id}/edit`)
    }

    if (isNaN(linkId)) {
        return {errors: [{message: "Invalid snippet ID", field: "snippetId"}]};
    }

    switch (linkType) {
        case "statBlocks":
            await scoutingRepository.linkStatBlockToOpportunity(opportunityId, linkId);
            return redirect('./');
        case "npcs":
            await scoutingRepository.linkNPCToOpportunity(opportunityId, linkId);
            return redirect('./');
        case "snippets":
            await scoutingRepository.linkSnippetToOpportunity(opportunityId, linkId);
            return redirect('./');
        case "followedBy":
            await scoutingRepository.linkOpportunities(opportunityId, linkId);
            return redirect('./');
        case "follows":
            await scoutingRepository.linkOpportunities(linkId, opportunityId);
            return redirect('./');
        default:
            return {errors: [{message: "Invalid link type", field: "linkType"}]};
    }
}

type LinkSpec = {
    label: string,
    header?: string,
    options: { value: number, label: string }[],
    selected: number[]
}

type LinksProps = {
    specs: Record<string, LinkSpec>
}

function Links({specs}: LinksProps) {
    const [addLinkType, setAddLinkType] = useState<string | null>(null);
    const currentSpec = addLinkType ? specs[addLinkType] : null;

    return <section className="links">
        <h2>Add links</h2>
        {currentSpec == null
         ? <div className="button-group small">
             {Object.entries(specs).map(
                 ([key, {label}]) =>
                     <button className="button info" onClick={() => setAddLinkType(key)}>
                         Add {label}
                     </button>
             )}
         </div>
         : <form method="post" action="?index">
             <input type="hidden" name="linkType" value={addLinkType!}/>
             <Autocomplete
                 name={'linkId'}
                 options={
                     currentSpec.options.filter(
                         ({value}) =>
                             !currentSpec.selected.includes(value)
                     )
                 }
                 label={currentSpec.label}
             />
             <div className="button-group small">
                 <button type={'submit'} className="button info">
                     Add {currentSpec.label}
                 </button>
                 <button
                     type={'button'}
                     className="button secondary"
                     onClick={() => setAddLinkType(null)}
                 >
                     Cancel
                 </button>
             </div>
         </form>
        }
        {Object.entries(specs).map(([key, {label, header = `${label}s`, options, selected}]) => (
            <div key={key} className="link-group">
                <h2 className="link-group-label">{header}</h2>
                <ul>
                    {selected.map((id) => {
                        const label = options.find(opt => opt.value === id)?.label ?? null;
                        if (label === null) {
                            return null
                        }
                        return (
                            <li key={id}>{label}</li>
                        );
                    })}
                </ul>
            </div>
        ))}
    </section>
}

export default function ({loaderData}: Route.ComponentProps) {
    const {opportunity} = useRouteLoaderData("opportunity") as { opportunity: OpportunityRow };
    const {event} = useRouteLoaderData("event") as { event: EventRow };

    return <>
        <div className='button-group float-right small'>
            <form method='post' action='?index'>
                <button className='button info' type='submit' name='action' value='duplicate'><FiCopy /> Duplicate</button>
            </form>
            <Link to={'./edit'} className="button primary small float-right"><FiEdit/> Edit Stat Block</Link>
        </div><span className="text-secondary text-uppercase small">{event.name}</span>
        <h1>
            {opportunity.code} - {opportunity.name}
        </h1>
        <div className="rating-row">
            <dl>
                <dt>Type</dt>
                <dd>{displayEnum(opportunity.opportunityType)}</dd>
            </dl>
            <dl>
                <dt>Difficulty</dt>
                <dd>{displayEnum(opportunity.difficultyLevel)}</dd>
            </dl>
            <dl>
                <dt>Threat</dt>
                <dd>{displayEnum(opportunity.threatLevel)}</dd>
            </dl>
        </div>
        <dl>
            <dt>Player description</dt>
            <dd><ReactMarkdown>{opportunity.playerDescription || '_None_'}</ReactMarkdown></dd>

            <dt>Useful skills</dt>
            <dd><ListOrNone values={opportunity.usefulSkills}/></dd>

            <dt>Requirements</dt>
            <dd><ListOrNone values={opportunity.requirements}/></dd>

            <dt>Monster briefing</dt>
            <dd><ReactMarkdown>{opportunity.monsterBriefing || '_None_'}</ReactMarkdown></dd>

            <dt>Items/props</dt>
            <dd><ListOrNone values={opportunity.items}/></dd>

            <dt>Expected result</dt>
            <dd><ReactMarkdown>{opportunity.expectedResult || '_None_'}</ReactMarkdown></dd>
        </dl>
        <Links specs={loaderData.links}/>
    </>
}
