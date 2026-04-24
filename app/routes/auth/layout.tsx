import {Outlet} from "react-router";
import "./auth.scss";
import FlashMessageBanner from "~/components/FlashMessageBanner";
import Breadcrumbs from "~/components/Breadcrumbs";

export default function AuthLayout() {
    return <main id='main' className='auth-layout'>
        <div className='auth-container'>
            <Breadcrumbs />
            <FlashMessageBanner />
            <Outlet />
        </div>
    </main>
}
