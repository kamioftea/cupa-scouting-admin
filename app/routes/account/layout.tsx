import type {Route} from './+types/layout';
import {Outlet, redirect} from "react-router";
import "./account.scss";

import {authContext} from "~/context/authContext";
import FlashMessageBanner from "~/components/FlashMessageBanner";
import Breadcrumbs from "~/components/Breadcrumbs";

export function loader({request, context}: Route.LoaderArgs) {
    const {user} = context.get(authContext);
    if (!user) {
        return redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
    }
}

export const handle = {
    breadcrumb: 'Account'
};

export default function AccountLayout() {
    return <main id='main' className='account-layout'>
        <Breadcrumbs />
        <FlashMessageBanner />
        <Outlet />
    </main>
}
