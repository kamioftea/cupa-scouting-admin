import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "CuPa Scouting Admin" },
		{ name: "description", content: "Manage scouting opportunities for Curious Pastimes events" },
	];
}


export default function Home({ }: Route.ComponentProps) {
    return <main id="main">
        <h1>Home Page</h1>
    </main>;
}
