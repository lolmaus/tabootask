import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import type { Handle } from '@sveltejs/kit';
import { handleRateLimit } from '$lib/hooks/handle-rate-limit';
import { handleAuth } from '$lib/hooks/handle-auth';
import { handleMockDb } from '$lib/hooks/handle-mock-db';

const handleParaglide: Handle = i18n.handle();

export enum COOKIE_NAMES {
	auth_session = 'auth_session',
	mock_db_session = 'mock_db_session',
	google_oauth_state = 'google_oauth_state',
	google_code_verifier = 'google_code_verifier',
}

export const handle: Handle = sequence(handleRateLimit, handleMockDb, handleAuth, handleParaglide);
