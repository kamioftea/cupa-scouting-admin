import {Link} from "react-router";

export function meta() {
    return [
        {title: `Account | CuPa Scouting`},
    ];
}

export default function AccountIndexPage() {
    return (
        <>
            <h1>Account</h1>
            <dl className='dl-horizontal'>
                <dt><Link to={'/account/details'}>Account details</Link></dt>
                <dd>Edit your profile and manage your user credentials</dd>
            </dl>
        </>
    );
}
