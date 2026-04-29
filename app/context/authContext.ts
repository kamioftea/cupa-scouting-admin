import {createContext, redirect, type RouterContextProvider, type Session} from "react-router";
import {type FlashData, getSessionStorage, type SessionData} from "./session.server";
import type {UserRepository} from "~/model/user.repository";
import {RoleValue, type UserWithRoles} from "~/model/user.types";
import {databaseContext} from "~/context/databaseContext.server";

type AuthProvider = {
    session: Session<SessionData, FlashData>;
    commitSession: (destroyIfEmpty?: boolean) => Promise<{'Set-Cookie': string}>;
    destroySession: () => Promise<{'Set-Cookie': string}>;
    userRepository: UserRepository;
    user?: UserWithRoles
}

export const authContext = createContext<AuthProvider>();

export const initAuth = async (request: Request, context: RouterContextProvider) => {
    const { session, commitSession, destroySession } = await getSessionStorage(request, context);
    const { userRepository } = context.get(databaseContext);

    const userId = session.get('userId');
    const user = userId ? await userRepository.findById(userId) ?? undefined : undefined;

    context.set(authContext, {session, commitSession, destroySession, userRepository, user});
}

export function authorised(request: Request, context: Readonly<RouterContextProvider>, role?: RoleValue | RoleValue[]): UserWithRoles {
    const {user} = context.get(authContext);

    if (!user) {
        throw redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
    }

    const roles = Array.isArray(role) ? role : role ? [role] : [];

    if (role && !roles.some(r => user.roles.includes(r))) {
        throw new Response("Unauthorized", {status: 401});
    }

    return user;
}
