import type {Route} from "./+types/register";
import {Link, redirect, useFetcher} from "react-router";
import Input from "~/components/form/Input";
import {z} from "zod";
import {Result} from "@bodil/opt";
import {authContext} from "~/context/authContext";
import {emailClientContext} from "~/context/emailClientContext";
import {VerifyAccountEmail} from "~/routes/auth/email/VerifyAccountEmail";
import {databaseContext} from "~/context/databaseContext.server";
import {cloudflareContext} from "~/context/cloudflareContext";
import {RoleValue} from "~/model/user.types";

const validator =
    z.object(
        {
            name: z.string().min(2, "Name must be at least 2 characters long"),
            email: z.email("Invalid email address"),
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
    const {session, commitSession} = context.get(authContext);
    const {emailClient} = context.get(emailClientContext);
    const {userRepository} = context.get(databaseContext);
    const {env} = context.get(cloudflareContext);

    const formData = Object.fromEntries(await request.formData());
    const {success, error, data} = await validator.safeParseAsync(formData);
    if (!success) {
        return {errors: error.issues};
    }

    const result = await Result.await(
        userRepository.registerUser(
            {
                ...data,
                roles: env.ADMIN_EMAIL === data.email.toLocaleLowerCase()
                       ? [RoleValue.Organiser]
                       : undefined
            }
        )
    );

    if (result.isErr()) {
        return {
            errors: [
                {
                    code: "custom",
                    path: [],
                    message: "Failed to store registration."
                } satisfies z.core.$ZodIssue
            ]
        };
    }

    const {token} = result.value;
    const verifyUrl = `${new URL(request.url).origin}/verify/${token}`;

    await emailClient.sendEmail(new VerifyAccountEmail(data.name, data.email, verifyUrl));

    session.flash('context', {registeredEmail: data.email});

    return redirect('/register-success', {headers: await commitSession()});
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: `Register for an account | Curious Tales`},
    ];
}

export function handle() {
    return {
        breadcrumb: 'Register for an account'
    }
}

export default function RegisterPage() {
    let fetcher = useFetcher<{ errors: z.core.$ZodIssue[] }>();
    const globalErrors = fetcher.data?.errors?.filter(e => e.path.length === 0);

    return <>
        <fetcher.Form method="post" className="credentials-form">
            <h2>Register for an account</h2>
            {globalErrors && globalErrors.length > 0 &&
                <div className="callout alert">
                    {globalErrors.map((error, idx) => (
                        <p key={idx}>{error.message}</p>
                    ))}
                </div>
            }
            <Input label="Name" name="name" autoComplete="name" errors={fetcher.data?.errors} defaultFocus/>
            <Input label="Email" name="email" autoComplete="email" errors={fetcher.data?.errors}/>

            <input type="submit" className="button primary" value="Register"/>

            <p>
                Already have an account? <Link to="/login">Log in.</Link>
            </p>
        </fetcher.Form>
    </>
}
