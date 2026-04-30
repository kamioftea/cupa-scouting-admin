import type {Route} from "./+types/edit";
import {Link, redirect, useFetcher} from "react-router";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import Input from "~/components/form/Input";
import TextArea from "~/components/form/TextArea";
import {FiLoader} from "react-icons/fi";
import {z} from "zod";
import {databaseContext} from "~/context/databaseContext.server";
import {nullablePositiveIntFromInput} from "~/utils/validation";

export function loader({context}: Route.LoaderArgs) {
    const statBlock =
        context.get(routeEntitiesContext).getEntity("statBlock");

    return {statBlock}
}

const validator =
    z.object(
        {
            name: z.string().min(1, "Enter the stat block name"),
            creatureClass: z.string().nullable(),
            hits: z.string().nullable(),
            magicPoints: nullablePositiveIntFromInput("magic points"),
            staminaPoints: nullablePositiveIntFromInput("stamina points"),
            workUnits: nullablePositiveIntFromInput("work units"),
            specialAttacks: z.string().nullable(),
            abilities: z.string().nullable(),
            skills: z.string().nullable(),
            vulnerabilities: z.string().nullable(),
            immunities: z.string().nullable(),
            items: z.string().nullable(),
        }
    )

export async function action({request, context}: Route.ActionArgs) {
    const {metadataRepository} = context.get(databaseContext);
    const statBlockId = context.get(routeEntitiesContext).getEntity("statBlock").statBlockId;

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const validationResult = validator.safeParse(data);

    if (!validationResult.success) {
        return {errors: validationResult.error.issues};
    }

    await metadataRepository.updateStatBlock(statBlockId, validationResult.data);

    return redirect(`..`);
}

export default function ({loaderData}: Route.ComponentProps) {
    const {statBlock} = loaderData ?? {};
    const fetcher = useFetcher();
    const errors = fetcher.data?.errors;

    return <>
        <h1>Edit {statBlock.name}</h1>
        <fetcher.Form method="post">
            <Input name={"name"} label="Name" defaultValue={statBlock?.name} defaultFocus errors={errors}/>
            <Input name={"creatureClass"}
                   label="Creature class"
                   defaultValue={statBlock?.creatureClass ?? undefined}
                   errors={errors}
            />
            <Input name={"hits"} label="Hits" defaultValue={statBlock?.hits ?? undefined} errors={errors}/>

            <div className="fun-token-row">
                <Input name={"magicPoints"}
                       label="Magic points"
                       defaultValue={statBlock?.magicPoints ?? undefined}
                       errors={errors}
                />
                <Input name={"staminaPoints"}
                       label="Stamina points"
                       defaultValue={statBlock?.staminaPoints ?? undefined}
                       errors={errors}
                />
                <Input name={"workUnits"}
                       label="Magic points"
                       defaultValue={statBlock?.workUnits ?? undefined}
                       errors={errors}
                />
            </div>

            <TextArea
                name={"specialAttacks"}
                label={"Special attacks"}
                rows={3}
                defaultValue={statBlock?.specialAttacks ?? undefined}
                errors={errors}
            />

            <TextArea
                name={"abilities"}
                label={"Abilities"}
                rows={3}
                defaultValue={statBlock?.abilities ?? undefined}
                errors={errors}
            />

            <TextArea
                name={"skills"}
                label={"Skills"}
                rows={3}
                defaultValue={statBlock?.skills ?? undefined}
                errors={errors}
            />

            <TextArea
                name={"items"}
                label={"Items"}
                rows={3}
                defaultValue={statBlock?.items ?? undefined}
                errors={errors}
            />

            <TextArea
                name={"vulnerabilities"}
                label={"Vulnerabilities"}
                rows={3}
                defaultValue={statBlock?.vulnerabilities ?? undefined}
                errors={errors}
            />

            <TextArea
                name={"immunities"}
                label={"Immunities"}
                rows={3}
                defaultValue={statBlock?.immunities ?? undefined}
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
