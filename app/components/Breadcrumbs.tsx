import {NavLink, useMatches} from "react-router";
import {type DetailedHTMLProps, type HTMLAttributes, useMemo} from "react";

export type BreadcrumbsProps = {
    navProps?: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
}

export default function Breadcrumbs({navProps = {}}: BreadcrumbsProps) {
    const matches = useMatches();
    const links =
        useMemo(
            () =>
                matches.flatMap(
                    match => {
                        if (!match.handle) {
                            return [];
                        }
                        const handle =
                            typeof match.handle === 'function'
                            ? match.handle(match)
                            : match.handle;
                        if (!handle?.breadcrumb) {
                            return [];
                        }
                        return [
                            ...(handle.ancestors ?? []),
                            {label: handle.breadcrumb, to: match.pathname}
                        ];
                    }
                ),
            [matches]
        );

    if (!links.length) {
        return null;
    }

    return <nav aria-label="Breadcrumbs" role="navigation" {...navProps}>
        <ul className="breadcrumbs">
            {links.map(({label, to}) =>
                           <li key={to}>
                               <NavLink end to={to}>{label}</NavLink>
                           </li>
            )}
        </ul>
    </nav>
}
