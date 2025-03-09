// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Db } from '$lib/server/db/db';
import type { SessionValidationResult } from '$lib/server/session';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: SessionValidationResult['user'];
			session: SessionValidationResult['session'];
			db: Db;
		}
	}
}

export {};
