import type {Route} from "./+types/layout";
import {Link, Outlet} from "react-router";
import Breadcrumbs from "~/components/Breadcrumbs";
import FlashMessageBanner from "~/components/FlashMessageBanner";
import {RoleValue} from "~/model/user.types";
import {authorised} from "~/context/authContext";

export async function loader({request, context}: Route.LoaderArgs) {
    authorised(request, context, [RoleValue.Organiser, RoleValue.Writer, RoleValue.Crew])
}

export const meta = () => {
    return [{title: `NPCs | CuPa Scouting`}];
}

export function handle() {
    return {
        breadcrumb: `NPCs`
    };
}

export default function NPCLayout() {
    return <main id="main" className="wide">
        <Breadcrumbs/>
        <FlashMessageBanner/>
        <div className="split-two-thirds">
            <section><Outlet/></section>
            <nav aria-label="Metadata navigation">
                <p><Link to={'/stat-blocks'}>Stat Blocks</Link></p>
            </nav>
        </div>
    </main>
}
