import { env } from '$env/dynamic/private';
import { DbManager } from '$lib/server/db/db-manager';
import type { Handle } from '@sveltejs/kit';
import type { Db } from '$lib/server/db/db';
import { COOKIE_NAMES } from './types';
import { generateMockDbSessionId } from './utils/mock-db-session-id';

const dbManager = new DbManager();

export const handleMockDb: Handle = async ({ event, resolve }) => {
	let db: Db;

	if (env.MOCK_DB === 'true') {
		let sessionId: string | undefined = event.cookies.get(COOKIE_NAMES.mock_db_session);

		if (!sessionId) {
			sessionId = generateMockDbSessionId();
			event.cookies.set(COOKIE_NAMES.mock_db_session, sessionId, { path: '/', httpOnly: true });
		}

		db = dbManager.getDb(sessionId);
	} else {
		db = dbManager.getDb();
	}

	event.locals.db = db;

	return resolve(event);
};
