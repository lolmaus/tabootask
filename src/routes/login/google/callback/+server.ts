import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/session';
import { decodeIdToken } from 'arctic';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { type User } from '$lib/server/db/schema';
import { v7 as uuidv7 } from 'uuid';
import z from 'zod';
import { env } from '$env/dynamic/private';
import { COOKIE_NAMES } from '$lib/hooks/types';

const claimsSchema = z.object({
	sub: z.string(),
	name: z.string()
});

type Claims = z.infer<typeof claimsSchema>;

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get(COOKIE_NAMES.google_oauth_state) ?? null;
	const codeVerifier = event.cookies.get(COOKIE_NAMES.google_code_verifier) ?? null;
	const db = event.locals.db;

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response('Authentication failed 1, please restart the process.', {
			status: 400
		});
	}

	if (state !== storedState) {
		return new Response('Authentication failed 2, please restart the process.', {
			status: 400
		});
	}

	let claimsRaw: unknown;

	if (env.MOCK_AUTH === 'true') {
		try {
			claimsRaw = JSON.parse(code);
		} catch (e) {
			throw new Error(`In MOCK_AUTH mode, the code is expected to be JSON, was: "${code}"`);
		}
	} else {
		let tokens: OAuth2Tokens;
		const { google } = await import('$lib/server/oauth');

		try {
			tokens = await google.validateAuthorizationCode(code, codeVerifier);
		} catch (e) {
			return new Response('Authentication failed 3, please restart the process.', {
				status: 400
			});
		}

		claimsRaw = decodeIdToken(tokens.idToken()) as { sub: string; name: string };
	}

	const claims: Claims = claimsSchema.parse(claimsRaw);
	const googleId = claims.sub;
	const username = claims.name;

	let user: User | undefined = await db.getUserByGoogleId(googleId);

	if (user) {
		const sessionToken = generateSessionToken();
		const session = await createSession(db, sessionToken, user.id);

		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}

	const id = uuidv7();
	user = await db.createUser({ id, googleId, username });
	const sessionToken = generateSessionToken();
	const session = await createSession(db, sessionToken, user.id);

	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
