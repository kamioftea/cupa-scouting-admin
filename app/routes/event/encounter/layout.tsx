import type {Route} from './+types/layout';
import {Outlet} from 'react-router';

export const handle = {breadcrumb: 'Encounters'};

export function meta({}: Route.MetaArgs) {
  return [
    {title: `Encounters | CuPa Scouting`},
  ];
}

export default function EncounterLayout() {
  return <><Outlet /></>
}
