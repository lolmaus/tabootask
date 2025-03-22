import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { handleRateLimit } from '$lib/hooks/handle-rate-limit';
import { handleAuth } from '$lib/hooks/handle-auth';
import { handleMockDb } from '$lib/hooks/handle-mock-db';
import { handleParaglide } from '$lib/hooks/handle-paraglide';

export const handle: Handle = sequence(handleRateLimit, handleMockDb, handleAuth, handleParaglide);
