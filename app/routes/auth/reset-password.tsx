import type {Route} from "./+types/reset-password";
import {Link, redirect, useFetcher} from "react-router";
import Input from "~/components/form/Input";
import {z} from "zod";
import {authContext} from "~/context/authContext";
import {emailClientContext} from "~/context/emailClientContext";
import {ResetPasswordEmail} from "~/routes/auth/email/ResetPasswordEmail";
import {databaseContext} from "~/context/databaseContext.server";

const validator =
    z.object(
        {
            email: z.email("Invalid email address"),
        }
    );

export async function loader({request, context}: Route.LoaderArgs) {
    const { user } = context.get(authContext);

    if ( user ) {
        const url = new URL(request.url);
        return redirect(url.searchParams.get("redirect") ?? "/");
    }

    return {};
}

export async function action({request, context}: Route.ActionArgs) {
    const { session, commitSession } = context.get(authContext);
    const { userRepository } = context.get(databaseContext);
    const { emailClient } = context.get(emailClientContext);

    const formData = Object.fromEntries(await request.formData());
    const validationResult = await validator.safeParseAsync(formData);
    if (!validationResult.success) {
        return {errors: validationResult.error.issues};
    }

    const maybeToken = await userRepository.createPasswordResetForEmail(validationResult.data.email);
    if (maybeToken.isSome()) {
        const {name, email, token} = maybeToken.value;
        const verifyUrl = `${new URL(request.url).origin}/verify/${token}`;
        await emailClient.sendEmail(new ResetPasswordEmail(name, email, verifyUrl));
    }

    session.flash('context', {registeredEmail: validationResult.data.email});

    return redirect('/reset-password-success', {headers: await commitSession()});
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Request a password reset | Curious Tales`},
    ];
}

export function handle() {
    return {
        breadcrumb: 'Request a password reset'
    }
}

// noinspection JSUnusedGlobalSymbols
export default function ResetPasswordPage() {
    let fetcher = useFetcher<{ errors: z.core.$ZodIssue[] }>();
    const globalErrors = fetcher.data?.errors?.filter(e => e.path.length === 0);

    return <>
        <fetcher.Form method="post" className="credentials-form">
            <h2>Request a password reset</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            {globalErrors && globalErrors.length > 0 &&
                <div className="callout alert">
                    {globalErrors.map((error, idx) => (
                        <p key={idx}>{error.message}</p>
                    ))}
                </div>
            }
            <Input label="Email" name="email" autoComplete="email" errors={fetcher.data?.errors} defaultFocus />
            <input type="submit" className="button primary" value="Send password reset"/>
            <p>
                Remembered your password? <Link to="/login">Log in.</Link>
            </p>
            <p>
                Don't have an account? <Link to="/register">Register.</Link>
            </p>
        </fetcher.Form>
    </>
}
