import {createWorkersKVSessionStorage} from "@react-router/cloudflare";
import type {RouterContextProvider} from "react-router";
import {cloudflareContext} from "~/context/cloudflareContext";
import type {FlashMessage} from "~/components/FlashMessageBanner";

export type SessionData = {
    userId?: number;
    redirectTo?: string;
    booking?: { sku: string, bookingId?: number };
}

export type FlashData = {
    flashMessage?: FlashMessage;
    context?: { [key: string]: string};
}

export async function getSessionStorage(request: Request, context: Readonly<RouterContextProvider>) {
    const { env: {SessionKV, IS_HTTPS, SESSION_SECRET} } = context.get(cloudflareContext);

    const url = new URL(request.url);

    const { getSession, commitSession, destroySession } = createWorkersKVSessionStorage<SessionData, FlashData>(
        {
            kv: SessionKV,
            cookie: {
                name: "__session",
                httpOnly: true,
                path: "/",
                sameSite: "strict",
                secure: IS_HTTPS !== "false",
                secrets: [SESSION_SECRET],
                maxAge: 60 * 60 * 24 * 7, // 1 week
                domain: url.hostname,
            },
        }
    );

    const session = await getSession(request.headers.get('Cookie'));
    const forceDestroySession = async () => {
        // Only destroy if session has an id
        if (session.id) {
            return {'Set-Cookie': await destroySession(session)};
        }
        // If no id, expire the cookie manually
        return {'Set-Cookie': '__session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict'};
    }

    return {
        session,
        async commitSession(destroyIfEmpty = false) {
            if (destroyIfEmpty && (session.data == null || Object.keys(session.data).length === 0)) {
                return forceDestroySession();
            }

            return {'Set-Cookie': await commitSession(session)};
        },
        async destroySession() {
            return forceDestroySession();
        }
    };
}
