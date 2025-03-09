import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/session.js';
import { COOKIE_NAMES } from '../../hooks.server';

export const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(COOKIE_NAMES.auth_session);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

    const db = event.locals.db;
	const { session, user } = await auth.validateSessionToken(db, sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};