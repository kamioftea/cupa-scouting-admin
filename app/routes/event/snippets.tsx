import type {Route} from "./+types/snippets";
import type {EventRow} from "~/model/drizzle/schema/logistics";
import {useFetcher, useRouteLoaderData} from "react-router";
import {appendToParentTitle} from "~/utils/routing";
import {routeEntitiesContext} from "~/context/routeEntitiesContext";
import {databaseContext} from "~/context/databaseContext.server";
import Input from "~/components/form/Input";
import {FiCheck, FiEdit, FiLoader, FiPlus, FiTrash} from "react-icons/fi";
import {useState} from "react";
import "./snippets.scss";

export const handle = {breadcrumb: "Information Snippets"};

export const meta = (args: Route.MetaArgs) => {
    return [appendToParentTitle('Snippets', args)]
}

export async function loader({context}: Route.LoaderArgs) {
    const {scoutingRepository} = context.get(databaseContext);
    const {getEntity} = context.get(routeEntitiesContext);
    const event = getEntity('event');

    return {
        snippets: await scoutingRepository.getSnippetsByEvent(event.eventId),
    }
}

export async function action({request, context}: Route.ActionArgs) {
    const {scoutingRepository} = context.get(databaseContext);
    const {getEntity} = context.get(routeEntitiesContext);
    const event = getEntity('event');

    const formData = await request.formData();
    const action = formData.get("action");
    const content = formData.get("content");

    switch (action) {
        case 'add': {
            if (typeof content !== "string" || content.trim() === "") {
                return {errors: [{path: ["content"], message: "Enter the snippet content"}]};
            }

            await scoutingRepository.addSnippet(event.eventId, content.trim());

            return {};
        }

        case 'edit': {
            const snippetId = Number(formData.get("snippetId"));
            console.log("Editing snippet with ID:", snippetId);
            if (isNaN(snippetId)) {
                return {errors: [{path: ["snippetId"], message: "No snippet id provided"}]};
            }
            if (typeof content !== "string" || content.trim() === "") {
                return {errors: [{path: ["content"], message: "Enter the snippet content"}]};
            }

            await scoutingRepository.updateSnippet(snippetId, content.trim());

            return {};
        }

        case 'delete': {
            const snippetId = Number(formData.get("snippetId"));
            if (isNaN(snippetId)) {
                return {errors: [{path: ["snippetId"], message: "No snippet id provided"}]};
            }

            await scoutingRepository.deleteSnippet(snippetId);

            return {};
        }
        default: return {}
    }
}

export default function SnippetsPage({loaderData}: Route.ComponentProps) {
    const {event} = useRouteLoaderData("event") as { event: EventRow }
    const fetcher = useFetcher();
    const {snippets} = loaderData;

    const [editId, setEditId] = useState<null | number>(null);
    const [deleteId, setDeleteId] = useState<null | number>(null);
    const [inputKey, setInputKey] = useState<string>(crypto.randomUUID());

    const [prevState, setPrevState] = useState(fetcher.state);
    if (prevState !== fetcher.state) {
        if (prevState !== "idle" && fetcher.state === "idle" && !fetcher.data?.errors) {
            setEditId(null);
            setDeleteId(null);
            setInputKey(crypto.randomUUID());
        }
        setPrevState(fetcher.state);
    }

    return <>
        <span className="text-secondary text-uppercase small">{event.name}</span>
        <h1>Information snippets</h1>

        {snippets.map(
            ({snippetId, content}) => {
                if (editId === snippetId) {
                    return <fetcher.Form key={snippetId} method="post" className="input-group">
                        <input type="hidden" name="snippetId" value={snippetId}/>
                        <Input
                            name="content"
                            className="input-group-field"
                            defaultValue={content}
                            defaultFocus
                            errors={fetcher.data?.errors}
                        />
                        <div className="input-group-button">
                            {fetcher.state === 'submitting' || fetcher.state === 'loading' ? (
                                <button className="button info loading" disabled>
                                    <FiLoader/>
                                </button>
                            ) : (
                                 <button name="action" value="edit" className="button info">
                                     <FiCheck/>
                                 </button>
                             )}
                        </div>
                    </fetcher.Form>
                }

                if (deleteId === snippetId) {
                    return <fetcher.Form key={snippetId} method="post" className="snippet-row">
                        <input type="hidden" name="snippetId" value={snippetId}/>
                        <span className="text-alert">Delete "{content}"?</span>
                        <button type="submit" name="action" value="delete" className="button small alert">Delete
                        </button>
                        <button
                            type="button"
                            className="button small secondary"
                            onClick={e => {
                                e.preventDefault();
                                setDeleteId(null)
                            }}
                        >
                            Cancel
                        </button>
                    </fetcher.Form>
                }

                return <div key={snippetId} className="snippet-row">
                    <span>{content}</span>
                    <button
                        name="action"
                        value="delete"
                        className="button small info"
                        onClick={e => {
                            e.preventDefault();
                            setEditId(snippetId);
                            setDeleteId(null);
                        }}
                    >
                        <FiEdit/>
                    </button>
                    <button
                        name="action"
                        value="delete"
                        className="button small alert"
                        onClick={e => {
                            e.preventDefault();
                            setEditId(null);
                            setDeleteId(snippetId);
                        }}
                    >
                        <FiTrash/>
                    </button>
                </div>
            }
        )}

        {!editId && !deleteId &&
            <fetcher.Form method="post">
                <div className="input-group">
                    <Input key={inputKey} name="content" className="input-group-field" defaultFocus errors={fetcher.data?.errors}/>
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
        }
    </>
}
