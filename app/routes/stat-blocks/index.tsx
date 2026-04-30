import type {Route} from "./+types/index";
import {Link, redirect, useFetcher} from "react-router";
import {databaseContext} from "~/context/databaseContext.server";
import Input from "~/components/form/Input";
import {FiLoader, FiPlus} from "react-icons/fi";

export async function loader({context}: Route.LoaderArgs) {
    const {metadataRepository} = context.get(databaseContext);

    return {
        statBlocks: await metadataRepository.findAllStatBlocks()
    };
}

export async function action({request, context}: Route.ActionArgs) {
    const {metadataRepository} = context.get(databaseContext);

    const formData = await request.formData();
    const action = formData.get("action");
    const name = formData.get("name");

    if (action === 'add') {
        if (typeof name !== "string" || name.trim() === "") {
            return {errors: [{path: ["name"], message: "Enter the stat block name"}]};
        }

        const statBlockId = await metadataRepository.createStatBlock(name.trim());

        return redirect(`./${statBlockId}/edit`);
    }

    return {};
}

export default function StatBlocksIndex({loaderData}: Route.ComponentProps) {
    const fetcher = useFetcher();

    return <>
        <h1>Stat Blocks</h1>

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
                    <th>Class</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {loaderData.statBlocks.map(
                    ({statBlockId, name, creatureClass}) =>
                        <tr key={statBlockId}>
                            <td><Link to={`./${statBlockId}`}>{name}</Link></td>
                            <td>{creatureClass}</td>
                            <td>-</td>
                        </tr>
                )}
            </tbody>
        </table>
    </>
}
