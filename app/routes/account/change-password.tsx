import type {Route} from './+types/change-password';
import {Link, redirect, useFetcher, useRouteLoaderData} from "react-router";
import type {User} from "~/model/user.types";
import Input from "~/components/form/Input";
import {authContext} from "~/context/authContext";
import {z} from "zod";
import GlobalErrorBanner from "~/components/form/GlobalErrorBanner";
import {NotifyPasswordChange} from "~/routes/account/email/NotifyPasswordChange";
import {emailClientContext} from "~/context/emailClientContext";
import {databaseContext} from "~/context/databaseContext.server";

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Change password | CuPa Scouting`},
    ];
}

export const handle = {
    breadcrumb: 'Change password'
};

const validator = z.object({
    currentPassword: z.string().min(12, "Current password must be at least 12 characters long"),
    newPassword: z.string().min(12, "New password must be at least 12 characters long"),
});

export async function action({ request, context }: Route.ActionArgs) {
    const {emailClient} = context.get(emailClientContext);
    const { userRepository } = context.get(databaseContext);
    const { user, session, commitSession } = context.get(authContext);

    if(!user) {
        return redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
    }

    const formData = Object.fromEntries(await request.formData());
    const updates = validator.safeParse(formData);
    if (!updates.success) {
        return {errors: updates.error.issues};
    }

    const result = await userRepository.updatePassword(user, updates.data.currentPassword, updates.data.newPassword);
    if (result.isErr()) {
        return {errors: [{code: "custom", path: [], message: result.value?.message}]};
    }

    await emailClient.sendEmail(new NotifyPasswordChange(user.name, user.email));

    session.flash('flashMessage', {
        message: 'Your password has been changed.',
        type: 'success'
    });

    return redirect('/account/details', { headers: await commitSession() });
}

// noinspection JSUnusedGlobalSymbols
export default function ChangePasswordPage() {
    const { user } = useRouteLoaderData("root") as { user: User };
    const fetcher = useFetcher();

    return <>
        <h1>Change password</h1>
        <fetcher.Form method='post'>
            <GlobalErrorBanner fetcher={fetcher} />
            <Input disabled name={'email'} label={'Email'} value={user.email} autoComplete="username"/>
            <Input
                name={'currentPassword'}
                type='password'
                label={'Current password'}
                autoComplete="current-password"
                errors={fetcher.data?.errors}
                defaultFocus
            />
            <Input
                name={'newPassword'}
                type="password"
                label={'New password'}
                autoComplete="new-password"
                errors={fetcher.data?.errors}
            />
            <input className='button primary' type='submit' value='Change password'/>{' '}
            <Link to='/account/details' className='button secondary'>Cancel</Link>
        </fetcher.Form>
    </>;
}
