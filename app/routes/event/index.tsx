import {useRouteLoaderData} from "react-router";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import type { EventRow } from "~/model/drizzle/schema";

export default function EventPage() {
    const {event} = useRouteLoaderData("event") as {event: EventRow}

    return <>
        <h1>{event.name}</h1>
        <p>Start: {dayjs(event.startDate).format('D MMM YYYY')}</p>
        {event.description && <ReactMarkdown>{event.description}</ReactMarkdown>}
    </>
}
