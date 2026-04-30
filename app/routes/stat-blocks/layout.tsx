import type {Route} from "./+types/layout";
import {Link, Outlet} from "react-router";
import Breadcrumbs from "~/components/Breadcrumbs";
import FlashMessageBanner from "~/components/FlashMessageBanner";
import {RoleValue} from "~/model/user.types";
import {authorised} from "~/context/authContext";

import "./stat-blocks.scss";

export async function loader({request, context}: Route.LoaderArgs) {
    authorised(request, context, [RoleValue.Organiser, RoleValue.Writer, RoleValue.Crew])
}

export const meta = () => {
    return [{title: `Stat Blocks | CuPa Scouting`}];
}

export function handle() {
    return {
        breadcrumb: `Stat Blocks`
    };
}

export default function EventLayout() {
    return <main id="main" className="wide">
        <Breadcrumbs/>
        <FlashMessageBanner/>
        <div className="split-two-thirds">
            <section><Outlet/></section>
            <nav aria-label="Admin navigation">
                <p><Link to={'./npcs'}>NPCs</Link></p>
            </nav>
        </div>
    </main>
}
