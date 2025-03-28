import { eq } from 'drizzle-orm';
import { initDrizzle } from './db-drizzle';
import { mockDbSchema, newMockDb, type MockDbSchema } from './db-mock';
import { sessionTable, userTable, type Session, type User } from './schema';
import assert from 'tiny-invariant';

export class Db {
	mockDb?: MockDbSchema;
	db?: ReturnType<typeof initDrizzle>;

	constructor(isMock: boolean) {
		if (isMock) {
			this.mockDb = newMockDb();
		} else {
			this.db = initDrizzle();
		}
	}

	replaceDb(dataRaw: unknown): void {
		this.mockDb = mockDbSchema.parse(dataRaw);
	}

	async createUser(user: { id: string; googleId: string; username: string }): Promise<User> {
		if (this.mockDb) {
			const newUser = { ...user, passwordHash: null };
			this.mockDb.users.push(newUser);
			return { ...newUser };
		} else {
			const [newUser] = await this.db!.insert(userTable).values(user).returning();
			assert(newUser, 'Expected newUser to exist at this point');
			return newUser;
		}
	}

	async getUserByGoogleId(googleId: string): Promise<User | undefined> {
		if (this.mockDb) {
			const user = this.mockDb.users.find((user) => user.googleId === googleId);
			return user && { ...user };
		} else {
			const [user] = await this.db!.select()
				.from(userTable)
				.where(eq(userTable.googleId, googleId));
			return user;
		}
	}

	async createSession(session: { id: string; userId: string; expiresAt: Date }): Promise<Session> {
		if (this.mockDb) {
			const newSession: Session = { ...session };
			this.mockDb.sessions.push(newSession);
			return { ...newSession };
		} else {
			const [newSession] = await this.db!.insert(sessionTable).values(session).returning();
			assert(newSession, 'Expected newSession to exist at this point');
			return newSession;
		}
	}

	async getSessionAndUserBySessionId(
		sessionId: string
	): Promise<{ user: User; session: Session } | undefined> {
		if (this.mockDb) {
			const session = this.mockDb.sessions.find((session) => session.id === sessionId);

			if (!session) return undefined;

			const user = this.mockDb.users.find((user) => user.id === session.userId);

			if (!user) return undefined;

			return { user: { ...user }, session: { ...session } };
		} else {
			const [result] = await this.db!.select({
				user: userTable,
				session: sessionTable
			})
				.from(sessionTable)
				.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
				.where(eq(sessionTable.id, sessionId));

			return result;
		}
	}

	async deleteSessionById(sessionId: string): Promise<void> {
		if (this.mockDb) {
			this.mockDb.sessions = this.mockDb.sessions.filter((session) => session.id !== sessionId);
		} else {
			await this.db!.delete(sessionTable).where(eq(sessionTable.id, sessionId));
		}
	}

	async deleteSessionByUserId(userId: string): Promise<void> {
		if (this.mockDb) {
			this.mockDb.sessions = this.mockDb.sessions.filter((session) => session.userId !== userId);
		} else {
			await this.db!.delete(sessionTable).where(eq(sessionTable.userId, userId));
		}
	}

	async updateSessionById(
		sessionId: string,
		props: Omit<Partial<Session>, 'id'>
	): Promise<Session | undefined> {
		if (this.mockDb) {
			const session: Session | undefined = this.mockDb.sessions.find(
				(session) => session.id === sessionId
			);
			if (session) Object.assign(session, props);
			return session && { ...session };
		} else {
			const [session] = await this.db!.update(sessionTable)
				.set(props)
				.where(eq(sessionTable.id, sessionId))
				.returning();

			return session;
		}
	}
}
