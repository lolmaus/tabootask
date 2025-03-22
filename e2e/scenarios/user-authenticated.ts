import { userFactory } from "../factories/user";
import { sessionFactory } from "../factories/session";
import { generateSessionToken, getSessionIdFromToken } from "../../src/lib/server/session";
import { Session, User } from "../../src/lib/server/db/schema";

export const userAuthenticated = (
    {username, sessionToken = generateSessionToken()}: {username?: string, sessionToken?: string} = {}
): {user: User, session: Session, sessionToken: string} => {
    const user = userFactory({username});

    const session = sessionFactory({
        id: getSessionIdFromToken(sessionToken),
        userId: user.id,
    });

    return {user, session, sessionToken};
}