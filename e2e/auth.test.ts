import { expect } from '@playwright/test';
import { userAuthenticatedWithCookie } from './scenarios/user-authenticated-with-cookie';
import { test } from './utils/test';
import { Session, User } from '../src/lib/server/db/schema';
import { mockDbSessionWithCookie } from './scenarios/mock-db-session-with-cookie';
import { userAuthenticated } from './scenarios/user-authenticated';
import { setMockDbCookie, setSessionCookie } from './utils/cookies';
import { seedReplaceDb } from './utils/seed';

const s = test.step.bind(test);

test('as anon, home should redirect to login', async ({ page: p }) => {
	await s('Visit root page', () => p.goto('/'));
	await s('Expect to have been redirected to login', () => p.waitForURL('/login'));
});

test('as anon, should be able to login', async ({ page: p, baseURL }) => {
	await s('Visit login page', () => p.goto('/login'));
	await s('Click log in link', () => p.getByRole('link', { name: 'Sign in with Google' }).click());
	await s('Expect to be on root page', () => p.waitForURL(baseURL));

	// 'Hi, Vasya Poopkin!' is hardcoded in MOCK_AUTH mode
	await s('Title should contain username', () =>
		expect(p.getByTestId('page root title')).toHaveText('Hi, Vasya Poopkin!')
	);

	await s('Checking the database', async () => {
		const response = await p.request.get('/debug/db');
		expect(response.ok()).toBeTruthy();
		const data = await response.json();

		await expect(data).toEqual(
			expect.objectContaining({
				users: [
					expect.objectContaining({
						googleId: '123',
						username: 'Vasya Poopkin'
					})
				]
			})
		);

		await expect(data.sessions).toHaveLength(1);
		await expect(data.sessions[0].userId).toEqual(data.users[0].id);
	});
});

test('as an authenticated user, should be able to visit as logged in', async ({
	page: p,
	baseURL,
	context
}) => {
	let user: User, session: Session;

	await s('seed', async () => {
		({ user, session } = await userAuthenticatedWithCookie({ context, baseURL }));

		await seedReplaceDb(p, {
			users: [user],
			sessions: [session]
		});
	});

	await s('Visit login page', () => p.goto('/'));

	await s('Title should contain username', async () => {
		const expectedTitle = `Hi, ${user.username}!`;
		await expect(p.getByTestId('page root title')).toHaveText(expectedTitle);
	});
});

test('two users should be able to share the same DB', async ({
	page: p,
	baseURL,
	browser,
	context
}) => {
	// `mockDbSessionWithCookie` creates a mock db cookie for `context`.
	// Later we will use `mockDbSessionId` to create an identical cookie for `context2`.
	const mockDbSessionId = await mockDbSessionWithCookie({ baseURL, context });

	let user1: User,
		session1: Session,
		sessionToken1: string,
		user2: User,
		session2: Session,
		sessionToken2: string;

	await s('seed', async () => {
		({ user: user1, session: session1, sessionToken: sessionToken1 } = await userAuthenticated());
		({ user: user2, session: session2, sessionToken: sessionToken2 } = await userAuthenticated());

		await seedReplaceDb(p, {
			users: [user1, user2],
			sessions: [session1, session2]
		});
	});

	await s('As user 1', async () => {
		setSessionCookie({ baseURL, context: context }, sessionToken1);

		await s('Visit login page', () => p.goto('/'));

		await s('Title should contain username', async () => {
			const expectedTitle = `Hi, ${user1.username}!`;
			await expect(p.getByTestId('page root title')).toHaveText(expectedTitle);
		});
	});

	await s('As user 2', async () => {
		const context2 = await browser.newContext();

		setMockDbCookie({ baseURL, context: context2 }, mockDbSessionId);
		setSessionCookie({ baseURL, context: context2 }, sessionToken2);

		const p2 = await context2.newPage();

		await s('Visit login page', () => p2.goto('/'));

		await s('Title should contain username', async () => {
			const expectedTitle = `Hi, ${user2.username}!`;
			await expect(p2.getByTestId('page root title')).toHaveText(expectedTitle);
		});

		await context2.close();
	});

	await s('The database must contain both users', async () => {
		const response = await p.request.get('/debug/db');
		expect(response.ok()).toBeTruthy();
		const data = await response.json();

		await expect(data).toEqual(
			expect.objectContaining({
				users: [user1, user2],
				sessions: [
					{ ...session1, expiresAt: session1.expiresAt.toISOString() },
					{ ...session2, expiresAt: session2.expiresAt.toISOString() }
				]
			})
		);
	});
});
