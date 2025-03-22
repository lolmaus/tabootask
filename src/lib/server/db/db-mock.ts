import { z } from 'zod';
import { createSchemaFactory } from 'drizzle-zod';
import { sessionTable, userTable } from './schema';

const { createSelectSchema } = createSchemaFactory({
	coerce: true
});

export const mockDbSchema = z.object({
	users: z.array(createSelectSchema(userTable)),
	sessions: z.array(createSelectSchema(sessionTable))
});

export type MockDbSchema = z.infer<typeof mockDbSchema>;

export const newMockDb = (): MockDbSchema => {
	return {
		users: [],
		sessions: []
	};
};
