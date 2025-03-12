import { z } from "zod";
import { createSchemaFactory } from 'drizzle-zod';
import { sessionTable, userTable } from "./schema";

const { createInsertSchema } = createSchemaFactory({
    coerce: true
  });

export const mockDbSchema = z.object({
    users: z.array(createInsertSchema(userTable)),
    sessions: z.array(createInsertSchema(sessionTable)),
})

export type MockDbSchema = z.infer<typeof mockDbSchema>;

export const newMockDb = (): MockDbSchema => {
    return {
        users: [],
        sessions: [],
    };
}
