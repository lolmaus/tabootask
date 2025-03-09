import { fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad, RequestEvent } from "./$types";
import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/session";

const logout = async (event: RequestEvent) => {
	if (event.locals.session === null) {
		return fail(401);
	}

	const {db} = event.locals;
	
	await invalidateSession(db, event.locals.session.id);
	deleteSessionTokenCookie(event);
	return redirect(302, "/login");
}

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user || !event.locals.session) {
		return redirect(302, "/login");
	}

	return {
		user: event.locals.user
	};
};

export const actions: Actions = {
	default: logout,
};