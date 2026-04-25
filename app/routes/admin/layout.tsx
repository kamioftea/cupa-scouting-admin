import type {Route} from "./+types/layout";
import {Link, Outlet} from "react-router";
import {authorised} from "~/context/authContext";
import FlashMessageBanner from "~/components/FlashMessageBanner";
import Breadcrumbs from "~/components/Breadcrumbs";

import {RoleValue} from "~/model/user.types";

export function loader({request, context}: Route.LoaderArgs) {
    authorised(request, context, RoleValue.Organiser)
}

export const handle = {
    breadcrumb: 'Admin',
};

export default function AdminLayout() {
    return <main id="main" className='wide'>
        <Breadcrumbs/>
        <FlashMessageBanner/>
        <div className="split-two-thirds">
            <section><Outlet/></section>
            <nav aria-label="Admin navigation">
                <p><Link to={'./users'}>Users</Link></p>
                <p><Link to={'./events'}>Events</Link></p>
            </nav>
        </div>
    </main>
}
