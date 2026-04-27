import type {Route} from "./+types/verify";
import {Link, redirect, useFetcher, useLoaderData} from "react-router";
import Input from "~/components/form/Input";
import {z} from "zod";
import {authContext} from "~/context/authContext";
import {databaseContext} from "~/context/databaseContext.server";

type LoaderData = { success: true, email: string } | { success: false, error: string };

const success = (email: string): LoaderData => ({success: true, email});
const failure = (error: string): LoaderData => ({success: false, error});

export const loader = async ({context, params}: Route.LoaderArgs): Promise<LoaderData> => {
    const { userRepository } = context.get(databaseContext);

    const {token} = params;
    if (!token) {
        return failure('No reset token provided');
    }

    const result = await userRepository.verifyResetToken(token);

    return result.match<LoaderData>(
        ({email}) => success(email),
        () => failure('Your reset request has expired')
    )
}

const validator =
    z.object(
        {
            password: z.string().min(12, "Password must be at least 12 characters long"),
        }
    );

export const action = async ({request, context, params}: Route.ActionArgs) => {
    const {session, commitSession} = context.get(authContext);
    const { userRepository } = context.get(databaseContext);

    const {token} = params;
    if (!token) {
        return {errors: [{code: "custom", path: [], message: "No reset token provided."} satisfies z.core.$ZodIssue]};
    }

    const formData = Object.fromEntries(await request.formData());
    const parseResult = await validator.safeParseAsync(formData);
    if (!parseResult.success) {
        return {errors: parseResult.error.issues};
    }

    const result = await userRepository.setPassword(parseResult.data.password, token);
    if (result.isErr()) {
        return {errors: [{code: "custom", path: [], message: "Failed to store registration."} satisfies z.core.$ZodIssue]};
    }

    session.set('userId', result.value);

    return redirect('/', {headers: await commitSession()});
}

export function meta({loaderData}: Route.MetaArgs) {
    return [
        {title: `${loaderData.success ? 'Set your new password' : 'Unable to verify your email'} | CuPa Scouting`},
    ];
}

export const handle = {
    breadcrumb: 'Verify email',
};

export default function VerifyPage() {
    const data = useLoaderData<LoaderData>();
    const fetcher = useFetcher<void>();

    if (!data.success) {
        return <>
            <h1>Unable to verify your email</h1>
            <div className="callout alert">
                <p className="error">{data.error}</p>
                <p>
                    <Link to={'/reset-password'}>Request a new token</Link>
                </p>
            </div>
        </>
    }

    return <>
        <h1>Set your new password</h1>
        <p>Thank you for verifying your email address. Please provide a new password for {data.email}</p>
        <fetcher.Form method="post">
            <Input disabled label="Email" name="email" value={data.email} autoComplete="username email" defaultFocus />
            <Input label="New Password" name="password" type="password" autoComplete="new-password"/>
            <input type="submit" className="button primary" value="Set new password"/>
        </fetcher.Form>
    </>
}
