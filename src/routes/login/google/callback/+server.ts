import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/session";
import { google } from "$lib/server/oauth";
import { decodeIdToken } from "arctic";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from 'uuid';


export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get("google_oauth_state") ?? null;
	const codeVerifier = event.cookies.get("google_code_verifier") ?? null;
	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400
		});
	}
	const claims = decodeIdToken(tokens.idToken());
	const googleId = claims.sub;
	const username = claims.name;

	const [existingUser] = await db.select().from(user).where(eq(user.googleId, googleId));

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	} else {
		const id = uuidv7();

		console.log('id', id)
		console.log('googleId', googleId)
		console.log('username', username)

		const [userRecord] = await db.insert(user).values({
			id,
			googleId,
			username,
		}).returning();

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, userRecord.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}
}
