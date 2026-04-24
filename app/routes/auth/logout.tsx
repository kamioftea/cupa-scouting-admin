import type {Route} from "./+types/logout"
import {redirect} from "react-router";
import {authContext} from "~/context/authContext";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/";

  const { destroySession } = context.get(authContext);
  return redirect(redirectTo, { headers: await destroySession() });
}
