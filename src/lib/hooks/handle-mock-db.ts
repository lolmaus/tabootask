import { env } from '$env/dynamic/private';
import { DbManager } from "$lib/server/db/db-manager";
import type { Handle } from "@sveltejs/kit";
import { COOKIE_NAMES } from "../../hooks.server";
import type { Db } from "$lib/server/db/db";

const dbManager = new DbManager();

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const handleMockDb: Handle = async ({ event, resolve }) => {
  let db: Db;

  if (env.MOCK_DB === 'true') {
    let sessionId: string | undefined = event.cookies.get(COOKIE_NAMES.mock_db_session);

    if (!sessionId) {
      sessionId = generateUniqueId();
      event.cookies.set(COOKIE_NAMES.mock_db_session, sessionId, { path: '/', httpOnly: true });
    }

    db = dbManager.getDb(sessionId);
  } else {
    db = dbManager.getDb();
  }
  
  event.locals.db = db;

  return resolve(event);
}
