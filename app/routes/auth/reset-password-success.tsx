import type {Route} from './+types/reset-password-success'
import {Link, redirect, useLoaderData} from "react-router";
import {authContext} from "~/context/authContext";

export async function loader({ context }: Route.LoaderArgs) {
    const { session, destroySession } = context.get(authContext);

    const registeredEmail = session.get("context")?.registeredEmail;
    if (!registeredEmail) {
        return redirect("/reset-password", {headers: await destroySession()});
    }

    return { registeredEmail };
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Your password reset has been submitted | Curious Tales`},
    ];
}

export function handle() {
    return {
        breadcrumb: 'Password reset requested'
    }
}

// noinspection JSUnusedGlobalSymbols
export default function RegisterSuccessPage() {
    const {registeredEmail} = useLoaderData<typeof loader>();

    return <>
        <h1>Your password reset has been submitted</h1>
        <p>
            If {registeredEmail} is associated with an account, an email has been
            sent with a link to reset your password.
        </p>
        <p>
            No email? <Link to={'/register'}>Try registering a new account.</Link>
        </p>
        <p>
            <Link to={'/'}>Return to home page.</Link>
        </p>
    </>
}
