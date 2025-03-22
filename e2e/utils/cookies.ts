import { BrowserContext } from '@playwright/test';
import { COOKIE_NAMES } from '../../src/lib/hooks/types';

export const setSessionCookie = (
	{ context, baseURL }: { context: BrowserContext; baseURL: string },
	sessionToken: string
): Promise<void> => {
	return context.addCookies([
		{
			name: COOKIE_NAMES.auth_session,
			domain: new URL(baseURL).hostname,
			value: sessionToken,
			httpOnly: true,
			path: '/',
			sameSite: 'Lax'
		}
	]);
};

export const setMockDbCookie = (
	{ baseURL, context }: { baseURL: string; context: BrowserContext },
	mockDbSessionId: string
): Promise<void> => {
	return context.addCookies([
		{
			name: COOKIE_NAMES.mock_db_session,
			domain: new URL(baseURL).hostname,
			value: mockDbSessionId,
			httpOnly: true,
			path: '/',
			sameSite: 'Lax'
		}
	]);
};
