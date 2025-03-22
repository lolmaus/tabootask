import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '$lib/server/oauth';

import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { COOKIE_NAMES } from '$lib/hooks/types';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile']);

	event.cookies.set(COOKIE_NAMES.google_oauth_state, state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax'
	});

	event.cookies.set(COOKIE_NAMES.google_code_verifier, codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax'
	});

	if (env.MOCK_AUTH === 'true') {
		const mockCode = encodeURIComponent(JSON.stringify({ sub: '123', name: 'Vasya Poopkin' }));
		const Location = `/login/google/callback?code=${mockCode}&state=${state}`;
		return new Response(null, {
			status: 302,
			headers: {
				Location
			}
		});
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
