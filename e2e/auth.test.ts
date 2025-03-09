import { expect, test } from '@playwright/test';

const s = test.step.bind(test);

test('as anon, should redirect to login', async ({ page: p }) => {
	await s('Visit root page', () => p.goto('/'));
	await s('Expect to have been redirected to login', () => p.waitForURL('/login'));
});

test('as anon, should be able to login', async ({ page: p }) => {
	await s('Visit login page', () => p.goto('/login'));
	await s('Click log in link', () => p.getByRole('link', { name: 'Sign in with Google' }).click());

	await p.waitForTimeout(10000);
})