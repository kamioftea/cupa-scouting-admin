import type {Route} from "./+types/root";
import React from "react";
import {
    data,
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData, useLocation,
} from "react-router";
import "./styles/root.scss";
import {TopBar} from "~/components/TopBar";
import SkipLink from "./components/SkipLink";
import {authContext} from "~/context/authContext";

export const headers: Route.HeadersFunction = () => ({
    "X-Clacks-Overhead": "GNU Terry Pratchett",
});

export async function loader({context}: Route.LoaderArgs) {
    const {user, session, commitSession} = context.get(authContext);
    const flashMessage = session.get("flashMessage");


    return data({user, flashMessage}, {headers: await commitSession(true)});
}

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
    {
        rel: "icon",
        type: "image/png",
        href: "/images/favicon.png",
        sizes: "32x32",
    },
    {
        rel: "icon",
        type: "image/png",
        href: "/images/favicon.png",
        sizes: "32x32",
        media: 'prefers-color-scheme: light'
    },
    {
        rel: "icon",
        type: "image/png",
        href: "/images/favicon-light.png",
        sizes: "32x32",
        media: 'prefers-color-scheme: dark'
    },
    {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    const {pathname, search} = useLocation();
    const {user} = useLoaderData<typeof loader>() ?? {user: null};
	// noinspection HtmlRequiredTitleElement
    return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
                <SkipLink />
                <TopBar user={user} key={`${pathname}${search}`}/>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export const handle = {
    breadcrumb: 'Home'
};

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
