import {createRequestHandler, RouterContextProvider} from "react-router";
import {cloudflareContext} from "~/context/cloudflareContext";
import {createDrizzleContext, drizzleContext} from "~/context/drizzleContext";
import {createEmailContext, emailClientContext} from "~/context/emailClientContext";
import {databaseContext} from "~/context/databaseContext.server";
import {DrizzleUserRepository} from "~/model/drizzle/user.server";
import {initAuth} from "~/context/authContext";
import {DrizzleLogisticsRepository} from "~/model/drizzle/logistics.server";

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
        const context = new RouterContextProvider();

        context.set(cloudflareContext, {env, ctx});
        context.set(drizzleContext, createDrizzleContext(env));
        context.set(emailClientContext, createEmailContext(env));
        context.set(databaseContext, {
            userRepository: new DrizzleUserRepository(context),
            logisticsRepository: new DrizzleLogisticsRepository(context),
        });

        await initAuth(request, context)

        return requestHandler(request, context);
	},
} satisfies ExportedHandler<Env>;
