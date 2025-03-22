import type { Handle } from '@sveltejs/kit';
import { COOKIE_NAMES } from './types';
import { deleteSessionTokenCookie, setSessionTokenCookie, validateSessionToken } from '$lib/server/session';

export const handleAuth: Handle = async ({ event, resolve }) => {
	// Skip for /debug/
	if (event.url.pathname.split('/')[1] === 'debug') {
		return resolve(event);
	}

	const sessionToken = event.cookies.get(COOKIE_NAMES.auth_session);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

    const db = event.locals.db;
	const { session, user } = await validateSessionToken(db, sessionToken);

	if (session) {
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event);
	}
 
	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};