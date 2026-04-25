import type {Route} from './+types/edit-profile';
import {Link, redirect, useFetcher, useRouteLoaderData} from "react-router";
import type {User} from "~/model/user.types";
import Input from "~/components/form/Input";
import {authContext} from "~/context/authContext";
import {z} from "zod";
import GlobalErrorBanner from "~/components/form/GlobalErrorBanner";
import {emailClientContext} from "~/context/emailClientContext";
import {NotifyPreviousEmail} from "~/routes/account/email/NotifyPreviousEmail";
import {ConfirmChangeEmail} from "~/routes/account/email/VerifyChangeEmail";
import {databaseContext} from "~/context/databaseContext.server";

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Edit Profile | Curious Tales`},
    ];
}

export const handle = {
    breadcrumb: 'Edit Profile'
};

const validator =
    z.object(
        {
            name: z.string().min(2, "Name must be at least 2 characters long"),
            email: z.email("Invalid email address"),
        }
    );

export async function action({request, context}: Route.ActionArgs) {
    const {emailClient} = context.get(emailClientContext);
    const { userRepository } = context.get(databaseContext);
    const {user, session, commitSession} = context.get(authContext);

    if(!user) {
        return redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
    }

    const formData = Object.fromEntries(await request.formData());
    const updates = validator.safeParse(formData);
    if (!updates.success) {
        return {errors: updates.error.issues};
    }

    if (updates.data.name !== user.name) {
        await userRepository.updateUser(user.userId, {name: updates.data.name});
    }

    if (updates.data.email !== user.email) {
        const {token} = await userRepository.getEmailChangeToken(user.email, updates.data.email);
        const verifyUrl = `${new URL(request.url).origin}/account/verify-email-change/${token}`;

        await emailClient.sendEmail(new NotifyPreviousEmail(user.name, user.email));
        await emailClient.sendEmail(new ConfirmChangeEmail(user.name, user.email, verifyUrl));

        session.flash('flashMessage', {
            message: 'An email has been sent to your new address with a link to complete the update.',
            type: 'info'
        });
    }

    return redirect('/account/details', {headers: await commitSession()});
}

// noinspection JSUnusedGlobalSymbols
export default function EditProfilePage() {
    const {user} = useRouteLoaderData("root") as { user: User };
    const fetcher = useFetcher<{ errors: z.core.$ZodIssue[] }>();

    return <>
        <h1>Edit profile</h1>
        <fetcher.Form method="post">
            <GlobalErrorBanner fetcher={fetcher}/>
            <Input name={'name'}
                   label={'Name'}
                   defaultValue={user?.name}
                   autoComplete="name"
                   errors={fetcher.data?.errors}
                   defaultFocus
            />
            <Input name={'email'}
                   label={'Email'}
                   defaultValue={user?.email}
                   autoComplete="name"
                   errors={fetcher.data?.errors}
            />
            <input type="submit" className="button primary" value="Update profile"/>{' '}
            <Link to="/account/details" className="button secondary">Cancel</Link>
        </fetcher.Form>
    </>;
}
