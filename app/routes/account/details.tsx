import type {Route} from './+types/details';
import {Link, useRouteLoaderData} from "react-router";
import type {User} from "~/model/user.types";

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Account details | CuPa Scouting`},
    ];
}

export const handle = {
    breadcrumb: 'Account details'
};

// noinspection JSUnusedGlobalSymbols
export default function AccountDetailsPage() {
    const { user } = useRouteLoaderData("root") as { user: User };

    return <>
        <h1>Account details</h1>
        <h2 className='subheader'>Profile</h2>
        <dl className='dl-horizontal'>
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
        </dl>
        <p><Link to={'/account/edit-profile'}>Edit profile</Link></p>
        <p><Link to={'/account/change-password'}>Change password</Link></p>
    </>;
}
