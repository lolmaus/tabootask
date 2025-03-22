import { Session } from '../../src/lib/server/db/schema';

export const sessionFactory = ({
	id,
	userId,
	expiresAt
}: Omit<Session, 'expiresAt'> & { expiresAt?: Session['expiresAt'] }): Session => {
	return {
		id,
		userId,
		expiresAt: expiresAt ?? new Date(new Date().setMonth(new Date().getMonth() + 1))
	};
};
