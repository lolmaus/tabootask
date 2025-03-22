import { Session, User } from '../../src/lib/server/db/schema';
import { generateSessionToken } from '../../src/lib/server/session';
import { setSessionCookie } from '../utils/cookies';
import { userAuthenticated } from './user-authenticated';
import { BrowserContext } from '@playwright/test';

export const userAuthenticatedWithCookie = async (
	{ context, baseURL }: { context: BrowserContext; baseURL: string },
	{
		username,
		sessionToken = generateSessionToken()
	}: { username?: string; sessionToken?: string } = {}
): Promise<{
	user: User;
	session: Session;
	sessionToken: string;
}> => {
	const { user, session } = userAuthenticated({ username, sessionToken });

	setSessionCookie({ baseURL, context }, sessionToken);

	return { user, session, sessionToken };
};
