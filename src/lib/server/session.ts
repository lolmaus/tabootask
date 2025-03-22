import type { RequestEvent } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32, encodeHexLowerCase } from '@oslojs/encoding';
import * as table from '$lib/server/db/schema';
import type { Db } from './db/db';
import assert from 'tiny-invariant';
import { COOKIE_NAMES } from '$lib/hooks/types';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export type SessionValidationResult =
	| {
			session: null;
			user: null;
	  }
	| {
			session: table.Session;
			user: table.User;
	  };

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes); // Modifies `tokenBytes` in place
	const token = encodeBase32(tokenBytes).toLowerCase();
	return token;
}

export const getSessionIdFromToken = (token: string): string => {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
};

export async function createSession(db: Db, token: string, userId: string) {
	const sessionId = getSessionIdFromToken(token);

	const session: table.Session = await db.createSession({
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	});

	return session;
}

export async function validateSessionToken(
	db: Db,
	token: string
): Promise<SessionValidationResult> {
	const sessionId = getSessionIdFromToken(token);
	const sessionAndUser = await db.getSessionAndUserBySessionId(sessionId);

	if (!sessionAndUser) {
		return { session: null, user: null };
	}

	const sessionExpired = Date.now() >= sessionAndUser.session.expiresAt.getTime();

	if (sessionExpired) {
		await db.deleteSessionById(sessionAndUser.session.id);
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= sessionAndUser.session.expiresAt.getTime() - DAY_IN_MS * 15;

	if (renewSession) {
		const expiresAt = new Date(Date.now() + DAY_IN_MS * 30);

		const updatedSession = await db.updateSessionById(sessionAndUser.session.id, { expiresAt });
		assert(updatedSession, 'Expected updatedSession to exist at this point');
		sessionAndUser.session = updatedSession;
	}

	return sessionAndUser;
}

export async function invalidateSession(db: Db, sessionId: string) {
	await db.deleteSessionById(sessionId);
}

export async function invalidateSessionsOfUser(db: Db, userId: string) {
	await db.deleteSessionByUserId(userId);
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(COOKIE_NAMES.auth_session, token, {
		expires: expiresAt,
		httpOnly: true,
		path: '/',
		sameSite: 'lax'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(COOKIE_NAMES.auth_session, {
		httpOnly: true,
		maxAge: 0,
		path: '/',
		sameSite: 'lax'
	});
}
