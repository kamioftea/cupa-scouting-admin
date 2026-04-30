import type {Route} from "./+types/index";
import {Link} from "react-router";
import {FiEdit} from "react-icons/fi";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {Fragment, type ReactNode} from "react";
import type {StatBlockRow} from "~/model/drizzle/schema/metadata";
import ReactMarkdown from "react-markdown";

export function loader({context}: Route.LoaderArgs) {
    const statBlock =
        context.get(routeEntitiesContext).getEntity("statBlock");

    return {statBlock}
}

type NonNullProps<T> = {
    [K in keyof T]: Exclude<T[K], null>;
};

type FieldRenderers<T> = {
    [K in keyof T]: [
        string,
        (value: T[K]) => ReactNode
    ]
};

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

function typedEntries<T extends Record<string, unknown>>(obj: T) {
    return Object.entries(obj) as {
        [K in keyof T]-?: [K, T[K]];
    }[keyof T][];
}

function renderField<K extends keyof DisplayFields>(fieldName: K, value: StatBlockRow[K]) {
    if (value == null || value === "") return null;

    const [label, renderer] = fieldRenderers[fieldName]

    return (
        <Fragment key={String(fieldName)}>
            <dt>{label}</dt>
            <dd>{renderer(value as DisplayFields[K])}</dd>
        </Fragment>
    );
}

export default function ({loaderData}: Route.ComponentProps) {
    const {statBlock} = loaderData;

    return <>
        <Link to={'./edit'} className="button primary small float-right"><FiEdit/> Edit Stat Block</Link>
        <h1>{statBlock.name}</h1>
        <dl className={'dl-horizontal'}>
            {typedEntries(fieldRenderers).map(([k]) => renderField(k, statBlock[k]))}
        </dl>
    </>
}
