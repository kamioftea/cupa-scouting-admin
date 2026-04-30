import type {Route} from "./+types/index";
import {Link} from "react-router";
import {FiEdit} from "react-icons/fi";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import type {StatBlockRow} from "~/model/drizzle/schema/metadata";
import ReactMarkdown from "react-markdown";
import type {NonNullProps} from "~/utils/types";
import EntityDefList, {type FieldRenderers} from "~/components/EntityDefList";

export function loader({context}: Route.LoaderArgs) {
    const statBlock =
        context.get(routeEntitiesContext).getEntity("statBlock");

    return {statBlock}
}

type DisplayFields = Omit<NonNullProps<StatBlockRow>, "statBlockId" | "name">;

const fieldRenderers: FieldRenderers<DisplayFields> = {
    creatureClass: ["Class", (value) => value],
    hits: ["Hits", (value) => value],
    magicPoints: ["Magic Points", (value) => value],
    staminaPoints: ["Stamina Points", (value) => value],
    workUnits: ["Work Units", (value) => value],
    specialAttacks: ["Special Attacks", (value) => <ReactMarkdown>{value}</ReactMarkdown>],
    abilities: ["Abilities", (value) => <ReactMarkdown>{value}</ReactMarkdown>],
    skills: ["Skills", (value) => <ReactMarkdown>{value}</ReactMarkdown>],
    vulnerabilities: ["Vulnerabilities", (value) => <ReactMarkdown>{value}</ReactMarkdown>],
    immunities: ["Immunities", (value) => <ReactMarkdown>{value}</ReactMarkdown>],
    items: ["Items", (value) => <ReactMarkdown>{value}</ReactMarkdown>],
};

export default function ({loaderData}: Route.ComponentProps) {
    const {statBlock} = loaderData;

    return <>
        <Link to={'./edit'} className="button primary small float-right"><FiEdit/> Edit Stat Block</Link>
        <h1>{statBlock.name}</h1>
        <EntityDefList renderers={fieldRenderers} data={statBlock as DisplayFields}/>
    </>
}
