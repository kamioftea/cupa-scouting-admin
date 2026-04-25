import type {Route} from './+types/users';
import {authorised} from "~/context/authContext";
import {RoleValue} from "~/model/user.types";
import {Link} from "react-router";
import {titleCase} from "~/utils/text";
import {databaseContext} from "~/context/databaseContext.server";

export async function loader({context}: Route.LoaderArgs) {
    authorised(context, RoleValue.Organiser);
    const { userRepository } = context.get(databaseContext);

    return {
        users: await userRepository.findAll(),
    };
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Users | Admin | Curious Tales`},
    ];
}

export default function UsersPage({loaderData}: Route.ComponentProps) {
    const {users} = loaderData;

    return <>
        <h2>Users</h2>
        <table className='hover'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roles</th>
                </tr>
            </thead>
            <tbody>
                {users.map(
                    ({userId, name, email, roles}) =>
                        <tr key={userId}>
                            <td><Link to={`/admin/users/${userId}`}>{name}</Link></td>
                            <td>{email}</td>
                            <td>
                                {
                                    roles.map(role => titleCase(role))
                                         .join(', ')
                                }
                            </td>
                        </tr>
                )}
            </tbody>
        </table>
    </>
}
