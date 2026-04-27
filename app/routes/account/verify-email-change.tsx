import type {Route} from './+types/verify-email-change';
import {Link, redirect, useFetcher} from "react-router";
import {authContext} from "~/context/authContext";
import {databaseContext} from "~/context/databaseContext.server";

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Confirm email address change | CuPa Scouting`},
    ];
}

export const handle = {
    breadcrumb: 'Confirm email address change'
};

export async function loader({request, context, params}: Route.LoaderArgs) {
    const { user, session, commitSession } = context.get(authContext);
    const { userRepository } = context.get(databaseContext);
    if(!user) {
        return redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
    }

    const emailChangeToken = await userRepository.verifyEmailChangeTokenForUser(params.token, user);
    if(emailChangeToken.isNone()) {
        session.flash('flashMessage', {
            message: 'That verification link isn\'t valid, please edit your email again to request a new one.',
            type: 'error'
        });
        return redirect('/account/details', {headers: await commitSession()});
    }

    return { ...emailChangeToken.value };
}

export async function action({request, context, params}: Route.ActionArgs) {
    const { user, commitSession } = context.get(authContext);
    const { userRepository } = context.get(databaseContext);

    if(!user) {
        return redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
    }

    await userRepository.updateUserEmailFromToken(params.token, user);

    return redirect('/account/details', {headers: await commitSession()});
}

// noinspection JSUnusedGlobalSymbols
export default function EditProfilePage({loaderData}: Route.ComponentProps) {
    const { new_email, old_email } = loaderData;
    const fetcher = useFetcher();

    return <>
        <h1>Confirm email address change</h1>
        <dl className='dl-horizontal'>
            <dt>Current email address:</dt>
            <dd>{old_email}</dd>

            <dt>New email address:</dt>
            <dd>{new_email}</dd>
        </dl>
        <fetcher.Form method='post'>
            <input type='submit' className='button primary' value='Update email'/>{' '}
            <Link to='/account/details' className='button secondary'>Cancel</Link>
        </fetcher.Form>
    </>;
}
