import { env } from '$env/dynamic/private';
import assert from 'tiny-invariant';
import { Db } from './db';

const DRIZZLE_DB_ID = 'DRIZZLE' as const;

export class DbManager {
	dbs: Map<string, Db> = new Map();

	constructor() {
		if (env.MOCK_DB !== 'true') {
			const db = new Db(false);
			this.dbs.set(DRIZZLE_DB_ID, db);
		}
	}

	getDb(sessionId?: string): Db {
		if (env.MOCK_DB === 'true') {
			assert(sessionId, 'sessionId is required in MOCK_DB mode');

			let db: Db | undefined = this.dbs.get(sessionId);

			if (db) {
				return db;
			} else {
				db = new Db(true);
				this.dbs.set(sessionId, db);
				return db;
			}
		} else {
			const db = this.dbs.get(DRIZZLE_DB_ID);
			assert(db, 'Expected db to exist at this point');
			return db;
		}
	}
}
