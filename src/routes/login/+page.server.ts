import { redirect } from "@sveltejs/kit";

import type { RequestEvent } from "./$types";

export async function load(event: RequestEvent) {
	if (event.locals.session !== null && event.locals.user !== null) {
        // Already logged in, don't need to be here on login page
		return redirect(302, "/");
	}

    // Do nothing, proceed to login page
	return {};
}
