import type {Route} from "./+types/login";
import {Link, redirect, useFetcher} from "react-router";
import Input from "~/components/form/Input";
import {z} from "zod";
import {authContext} from "~/context/authContext";
import GlobalErrorBanner from "~/components/form/GlobalErrorBanner";
import {databaseContext} from "~/context/databaseContext.server";

const validator =
    z.object(
        {
            email: z.email("Invalid email address"),
            password: z.string(),
        }
    );

export async function loader({request, context}: Route.LoaderArgs) {
    const {user} = context.get(authContext);

    if (user) {
        const url = new URL(request.url);
        return redirect(url.searchParams.get("redirect") ?? "/");
    }

    return {};
}

export async function action({request, context}: Route.ActionArgs) {
    const { userRepository } = context.get(databaseContext);

    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirect") || "/";

    const formData = Object.fromEntries(await request.formData());
    const validationResult = await validator.safeParseAsync(formData);
    if (!validationResult.success) {
        return {errors: validationResult.error.issues};
    }

    const maybeUser = await userRepository.loginUser(validationResult.data);
    if (maybeUser.isNone()) {
        return {errors: [{code: "custom", path: [], message: "Invalid email or password."} satisfies z.core.$ZodIssue]};
    }

    const {session, commitSession} = context.get(authContext);
    session.set('userId', maybeUser.value.userId);

    return redirect(redirectTo, {headers: await commitSession()});
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Log in to your account | Curious Tales`},
    ];
}

export const handle = {
    breadcrumb: 'Log in to your account'
}

export default function LoginPage() {
    let fetcher = useFetcher<{ errors: z.core.$ZodIssue[] }>();

    return <>
        <fetcher.Form method="post" className="credentials-form">
            <h2>Log in to your account</h2>
            <GlobalErrorBanner fetcher={fetcher}/>
            <Input label="Email" name="email" autoComplete="email username" errors={fetcher.data?.errors} defaultFocus />
            <Input label="Password" name="password" type="password" autoComplete="current-password"
                   errors={fetcher.data?.errors}/>
            <input type="submit" className="button primary" value="Log in"/>
            <p>
                Don't have an account? <Link to="/register">Register.</Link>
            </p>
            <p>
                Forgotten your password? <Link to="/reset-password">Request a password reset.</Link>
            </p>
        </fetcher.Form>
    </>
}
