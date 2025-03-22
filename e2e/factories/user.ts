import { User } from "../../src/lib/server/db/schema"
import { v7 as uuidv7 } from 'uuid';
import { randEmail, randFullName } from '@ngneat/falso';


export const userFactory = ({id, username, googleId, ...props}: Partial<User> = {}): User => {
    return {
        id: id ?? uuidv7(),
        username: username ?? randFullName(),
        googleId: googleId ?? randEmail(),
        passwordHash: '',
        ...props,
    }
}