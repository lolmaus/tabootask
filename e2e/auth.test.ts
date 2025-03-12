import { expect, test } from '@playwright/test';
import {MockDbSchema} from '../src/lib/server/db/db-mock';
import {generateSessionToken, getSessionIdFromToken} from '../src/lib/server/session';
import {COOKIE_NAMES} from '../src/lib/hooks/types';
import { v7 as uuidv7 } from 'uuid';

const s = test.step.bind(test);

test('as anon, home should redirect to login', async ({ page: p }) => {
	await s('Visit root page', () => p.goto('/'));
	await s('Expect to have been redirected to login', () => p.waitForURL('/login'));
});

test('as anon, should be able to login', async ({ page: p, baseURL }) => {
	await s('Visit login page', () => p.goto('/login'));
	await s('Click log in link', () => p.getByRole('link', { name: 'Sign in with Google' }).click());
	await s('Expect to be on root page', () => p.waitForURL(baseURL!));

	// 'Hi, Vasya Poopkin!' is hardcoded in MOCK_AUTH mode
	await s('Title should contain username', () => expect(p.getByTestId('page root title')).toHaveText('Hi, Vasya Poopkin!'));
	
	await s('Checking the database', async () => {
		const response = await p.request.get('/debug/db');
		expect(response.ok()).toBeTruthy();
		const data = await response.json();

		await expect(data).toEqual(expect.objectContaining({
			users: [
				expect.objectContaining({
					"googleId": "123",
					"username": "Vasya Poopkin",
				})
			]
		}));

		await expect(data.sessions).toHaveLength(1);
		await expect(data.sessions[0].userId).toEqual(data.users[0].id);
	});
});

test('as a new user, should be able to sign up', async ({ page: p, baseURL, context }) => {
	await s('seed', async () => {
		const sessionToken = generateSessionToken();
		const sessionId = getSessionIdFromToken(sessionToken);
		const userId = uuidv7();
	
		await p.request.post('/debug/db', {
			data: {
				users: [{
					id: userId,
					googleId: '234',
					username: 'Petya Taburetkin',
				}],
				sessions: [{
					id: sessionId,
					userId,
					expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
				}]
			} satisfies MockDbSchema
		});

		context.addCookies([{
			name: COOKIE_NAMES.auth_session,
			domain: new URL(baseURL!).hostname,
			value: sessionToken,
			httpOnly: true,
			path: '/',
			sameSite: "Lax",
		}])
	});

	await s('Visit login page', () => p.goto('/'));
	await s('Title should contain username', () => expect(p.getByTestId('page root title')).toHaveText('Hi, Petya Taburetkin!'));
});
