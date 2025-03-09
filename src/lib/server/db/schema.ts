import { sql } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
	id: uuid('id').notNull().primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash'),
	googleId: text('google_id')
});

export const sessionTable = pgTable('session', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof sessionTable.$inferSelect;

export type User = typeof userTable.$inferSelect;
