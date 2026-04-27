import type {Route} from './+types/user'
import {authContext} from "~/context/authContext";
import type {UserWithRoles} from "~/model/user.types";
import {RoleValue} from "~/model/user.types";
import {data, redirect, useFetcher} from "react-router";
import Input from "~/components/form/Input";
import CheckboxGroup from "~/components/form/CheckboxGroup";
import {titleCase} from "~/utils/text";
import {z} from "zod";
import GlobalErrorBanner from "~/components/form/GlobalErrorBanner";
import {databaseContext} from "~/context/databaseContext.server";

export async function loader({context, params}: Route.LoaderArgs) {
    const { userRepository } = context.get(databaseContext);
    const {session, commitSession} = context.get(authContext);

    const userId = parseInt(params.userId)
    const user = await userRepository.findById(userId);
    const roles = Object.values(RoleValue);

    if (!user) {
        session.flash('flashMessage', {type: 'error', message: `No user with id: ${userId}`});
        return redirect('/admin/users', {headers: await commitSession()});
    }

    return {user, roles}
}

const validator = z.object(
    {
        name: z.string().min(2, "Name must be at least 2 characters long"),
        email: z.email("Invalid email address"),
        roles: z.array(z.enum(RoleValue))
    }
);

export async function action({context, params, request}: Route.ActionArgs) {
    const { userRepository } = context.get(databaseContext);
    const {user: currentUser, session, commitSession} = context.get(authContext);
    const userId = parseInt(params.userId);
    const targetUser = await userRepository.findById(userId);
    const formData = await request.formData();

    if (!targetUser) {
        session.flash('flashMessage', {type: 'error', message: `No user with id: ${userId}`});
        return redirect('/admin/users', {headers: await commitSession()});
    }

    const updates = validator.safeParse(
        {
            name: formData.get('name'),
            email: formData.get('email'),
            roles: formData.getAll('roles')
        }
    );

    if (!updates.success) {
        return {errors: updates.error.issues};
    }

    if (targetUser.userId === currentUser!.userId && !updates.data.roles.includes(RoleValue.Organiser)) {
        return {
            errors: [
                {
                    code: "custom",
                    path: ['roles'],
                    message: "You cannot remove your own organiser role."
                }
            ] as z.core.$ZodIssue[]
        };
    }

    await userRepository.updateUser(userId, updates.data);

    session.flash('flashMessage', {type: 'success', message: `User updated successfully.`});
    return data({errors: []}, {headers: await commitSession()});
}

export const meta = ({loaderData}: Route.MetaArgs) => {
    return [
        {title: `${loaderData.user.name} | Users | Admin | CuPa Scouting`},
    ];
}

export function handle({loaderData}: {loaderData: {user: UserWithRoles}}) {
    return {
        breadcrumb: `${loaderData.user.name}`
    };
}

export default function UserAdminPage({loaderData}: Route.ComponentProps) {
    const {user, roles} = loaderData;
    const fetcher = useFetcher();
    const options = roles.map(
        role => ({label: titleCase(role), value: role})
    );

    return <>
        <fetcher.Form method="post">
            <GlobalErrorBanner fetcher={fetcher}/>
            <Input name="name" defaultValue={user.name} label="Name" errors={fetcher.data?.errors} defaultFocus />
            <Input name="email" defaultValue={user.email} label="Email" errors={fetcher.data?.errors}/>
            <CheckboxGroup
                legend="Roles"
                name="roles"
                options={options}
                defaultSelected={user.roles}
                errors={fetcher.data?.errors}
            />
            <input type="submit" className="button primary" value='Update User' />
        </fetcher.Form>
    </>
}
