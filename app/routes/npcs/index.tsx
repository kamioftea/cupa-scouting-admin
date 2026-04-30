import type {Route} from "./+types/index";
import {Link, redirect, useFetcher} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import Input from "~/components/form/Input";
import {FiLoader, FiPlus} from "react-icons/fi";

export async function loader({context}: Route.LoaderArgs) {
    const {metadataRepository} = context.get(databaseContext);

    return {
        npcs: await metadataRepository.findAllNPCs()
    };
}

export async function action({request, context}: Route.ActionArgs) {
    const {metadataRepository} = context.get(databaseContext);

    const formData = await request.formData();
    const action = formData.get("action");
    const name = formData.get("name");

    if (action === 'add') {
        if (typeof name !== "string" || name.trim() === "") {
            return {errors: [{path: ["name"], message: "Enter the NPC name"}]};
        }

        const npcId = await metadataRepository.createNPC(name.trim());

        return redirect(`./${npcId}`);
    }

    return {};
}

export default function StatBlocksIndex({loaderData}: Route.ComponentProps) {
    const fetcher = useFetcher();

    return <>
        <h1>NPCs</h1>

        <fetcher.Form method="post">
            <div className="input-group">
                <Input name="name" className="input-group-field" defaultFocus errors={fetcher.data?.errors}/>
                <div className="input-group-button">
                    {fetcher.state === 'submitting' || fetcher.state === 'loading' ? (
                        <button className="button success loading" disabled>
                            <FiLoader/>
                        </button>
                    ) : (
                         <button name="action" value="add" className="button success">
                             <FiPlus/>
                         </button>
                     )}
                </div>
            </div>
        </fetcher.Form>

        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Player</th>
                    <th>Stat block</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {loaderData.npcs.map(
                    ({npcId, name, player, statBlock}) =>
                        <tr key={npcId}>
                            <td><Link to={`./${npcId}`}>{name}</Link></td>
                            <td>{player ?? '-'}</td>
                            <td>{statBlock?.name ?? '-'}</td>
                            <td>-</td>
                        </tr>
                )}
            </tbody>
        </table>
    </>
}
