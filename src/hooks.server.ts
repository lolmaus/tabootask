import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import type { Handle } from '@sveltejs/kit';
import { handleRateLimit } from '$lib/hooks/handle-rate-limit';
import { handleAuth } from '$lib/hooks/handle-auth';
import { handleMockDb } from '$lib/hooks/handle-mock-db';

const handleParaglide: Handle = i18n.handle();

export const handle: Handle = sequence(handleRateLimit, handleMockDb, handleAuth, handleParaglide);
