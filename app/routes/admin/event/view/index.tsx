import {Link, useRouteLoaderData} from "react-router";
import dayjs from "dayjs";
import {FiEdit} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import type { EventRow } from "~/model/drizzle/schema";

export default function UserAdminPage() {
    const {event} = useRouteLoaderData("event") as {event: EventRow}

    return <>
        <Link to={'./edit'} className='button primary small float-right'><FiEdit /> Edit details</Link>
        <h1>{event.name}</h1>
        <p>Start: {dayjs(event.startDate).format('D MMM YYYY')}</p>
        {event.description && <ReactMarkdown>{event.description}</ReactMarkdown>}
    </>
}
