import type {Route} from './+types/register-success'
import {Link, redirect, useLoaderData} from "react-router";
import {authContext} from "~/context/authContext";

export async function loader({ context }: Route.LoaderArgs) {
    const { session, destroySession } = context.get(authContext);

    const registeredEmail = session.get("context")?.registeredEmail;
    if (!registeredEmail) {
        return redirect("/register", {headers: await destroySession()});
    }

    return { registeredEmail };
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Your registration has been submitted | Curious Tales`},
    ];
}

export function handle() {
    return {
        breadcrumb: 'Registration submitted'
    }
}

// noinspection JSUnusedGlobalSymbols
export default function RegisterSuccessPage() {
    const {registeredEmail} = useLoaderData<typeof loader>();

    return <>
        <h1>Your registration has been submitted</h1>
        <p>
            An email has been sent to {registeredEmail} with a link to verify your email and finish setting up your
            account.
        </p>
        <p>
            <Link to={'/'}>Return to home page.</Link>
        </p>
    </>
}
