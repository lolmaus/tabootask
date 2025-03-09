import type { Session, User } from "./schema";

export interface MockDbSchema {
    users: User[],
    sessions: Session[];
}

export const newMockDb = (): MockDbSchema => {
    return {
        users: [],
        sessions: [],
    };
}