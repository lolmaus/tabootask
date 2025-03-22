import type { Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';

const handle: Handle = i18n.handle();

export const handleParaglide: Handle = async ({ event, resolve }) => {
	// Skip for /debug/
	if (event.url.pathname.split('/')[1] === 'debug') {
		return resolve(event);
	}

	return handle({ event, resolve });
};