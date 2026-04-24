import type {Route} from "./+types/layout";
import {Outlet, redirect} from "react-router";
import {authContext} from "~/context/authContext";
import FlashMessageBanner from "~/components/FlashMessageBanner";
import Breadcrumbs from "~/components/Breadcrumbs";

import {RoleValue} from "~/model/user.types";

export function loader({request, context}: Route.LoaderArgs) {
    const {user} = context.get(authContext);

    if (!user) {
        return redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
    }

    if (!user.roles.includes(RoleValue.Organiser)) {
        throw new Response('Not found', {status: 404});
    }
}

export const handle = {
    breadcrumb: 'Admin',
};

export default function AdminLayout() {
    return <main id='main'>
        <h1>Admin</h1>
        <Breadcrumbs />
        <FlashMessageBanner />
        <Outlet/>
    </main>
}
