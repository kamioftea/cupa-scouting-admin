import type {Route} from "./+types/index";
import {Link} from "react-router";
import {FiEdit} from "react-icons/fi";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {type NPCRow, type StatBlockRow} from "~/model/drizzle/schema/metadata";
import ReactMarkdown from "react-markdown";
import type {NonNullProps} from "~/utils/types";
import EntityDefList, {type FieldRenderers} from "~/components/EntityDefList";

export function loader({context}: Route.LoaderArgs) {
    const npc =
        context.get(routeEntitiesContext).getEntity("npc");

    return {npc}
}

type DisplayFields = Omit<NonNullProps<NPCRow & {statBlock: StatBlockRow | null}>, "npcId" | "name" | "statBlockId">;

const fieldRenderers: FieldRenderers<DisplayFields> = {
    player: ["Player", value => value],
    overview: ["Overview", value => <ReactMarkdown>{value}</ReactMarkdown>],
    statBlock: ["StatBlock", value => `TODO: table (${value.name})`],
};

export default function ({loaderData}: Route.ComponentProps) {
    const {npc} = loaderData;

    return <>
        <Link to={'./edit'} className="button primary small float-right"><FiEdit/> Edit Stat Block</Link>
        <h1>{npc.name}</h1>
        <EntityDefList renderers={fieldRenderers} data={npc as DisplayFields} />
    </>
}
