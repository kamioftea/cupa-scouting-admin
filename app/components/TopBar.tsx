import "./top-bar.scss"
import {useEffect, useRef} from "react";
import {Link, useLocation} from "react-router";
import {RoleValue, type UserWithRoles} from "~/model/user.types";

export type TopBarProps = {
    user?: UserWithRoles
}

export function TopBar({user}: TopBarProps) {
    const navRef = useRef<HTMLElement>(null);
    const location = useLocation();
    const currentUrl = location.pathname + location.search;

    useEffect(() => {
        const activeElement = document.activeElement;

        if (activeElement instanceof HTMLElement && navRef.current?.contains(activeElement)) {
            activeElement.blur();
        }
    }, [location.pathname, location.search, location.hash]);

    return <nav className="top-bar" ref={navRef}>
        <div className="top-bar-container">
            <div className='top-bar-left'>
                <ul className="dropdown menu">
                    <li className="home-link">
                        <Link to={'/'}>CuPa Scouting</Link>
                    </li>
                </ul>
            </div>
            <div className='top-bar-right'>
                {user
                 ? <ul className="dropdown menu">
                     <li tabIndex={0}>
                         <span className="menu-text">{user.name}</span>
                         <ul className="menu vertical right-aligned">
                             <li><Link to="/account/details">Account</Link></li>
                             <li><Link to={`/logout?redirect=${encodeURIComponent(currentUrl)}`}>Logout</Link></li>
                             {user.roles.includes(RoleValue.Organiser)
                              ? <li><Link to={'/admin'}>Admin</Link></li>
                              : null
                             }
                         </ul>
                     </li>
                 </ul>
                 : <ul className="dropdown menu">
                     <li tabIndex={0}>
                         <span className="menu-text">Account</span>
                         <ul className="menu vertical right-aligned">
                             <li><Link to="/register">Register</Link></li>
                             <li><Link to={`/login?redirect=${encodeURIComponent(currentUrl)}`}>Login</Link></li>
                         </ul>
                     </li>
                 </ul>
                }
            </div>
        </div>
    </nav>
}
