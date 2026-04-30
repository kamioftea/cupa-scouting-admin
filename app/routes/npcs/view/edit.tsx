import type {Route} from "./+types/edit";
import {Link, redirect, useFetcher} from "react-router";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import Input from "~/components/form/Input";
import TextArea from "~/components/form/TextArea";
import {FiLoader} from "react-icons/fi";
import {z} from "zod";
import {databaseContext} from "~/context/databaseContext.server";
import Autocomplete from "~/components/Autocomplete";
import {nullablePositiveIntFromInput} from "~/utils/validation";

export async function loader({context}: Route.LoaderArgs) {
    const npc = context.get(routeEntitiesContext).getEntity("npc");
    const {metadataRepository} = context.get(databaseContext);

    const statBlocks =
        (await metadataRepository.findAllStatBlocks())
    .map(({statBlockId, name}) => ({
        value: statBlockId,
        label: name,
    }))

    return {npc, statBlocks}
}

const validator =
    z.object(
        {
            name: z.string().min(1, "Enter the NPC name"),
            player: z.string().nullable(),
            overview: z.string().nullable(),
            statBlockId: nullablePositiveIntFromInput("Stat block")
        }
    )

export async function action({request, context}: Route.ActionArgs) {
    const {metadataRepository} = context.get(databaseContext);
    const npcId = context.get(routeEntitiesContext).getEntity("npc").npcId;

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const validationResult = validator.safeParse(data);

    if (!validationResult.success) {
        return {errors: validationResult.error.issues};
    }

    await metadataRepository.updateNPC(npcId, validationResult.data);

    return redirect(`..`);
}

export default function ({loaderData}: Route.ComponentProps) {
    const {npc, statBlocks} = loaderData ?? {};
    const fetcher = useFetcher();
    const errors = fetcher.data?.errors;

    return <>
        <h1>Edit {npc.name}</h1>
        <fetcher.Form method="post">
            <Input name={"name"} label="Name" defaultValue={npc?.name} defaultFocus errors={errors}/>
            <Input name={"player"}
                   label="Player"
                   defaultValue={npc?.player ?? undefined}
                   errors={errors}
            />

            <TextArea
                name={"overview"}
                label={"Overview"}
                rows={3}
                defaultValue={npc?.overview ?? undefined}
                errors={errors}
            />

            <Autocomplete
                name='statBlockId'
                label="Stat block"
                options={statBlocks}
                defaultValue={npc?.statBlockId ?? undefined}
                errors={errors}
            />

            {fetcher.state === 'submitting' || fetcher.state === 'loading' ? (
                <button className="button success small loading" disabled>
                    <FiLoader/> Submitting
                </button>
            ) : (
                 <button name="action" value="add" className="button small success">
                     Save changes
                 </button>
             )}{' '}
            <Link to=".." className="button small secondary">Cancel</Link>
        </fetcher.Form>
    </>
}
