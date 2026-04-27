import type {Route} from './+types/layout';
import {Outlet} from 'react-router';
import './opportunity.scss';

export const handle = {breadcrumb: 'Opportunities'};

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Opportunities | CuPa Scouting`},
    ];
}

export default function OpportunityLayout() {
    return <><Outlet /></>
}
