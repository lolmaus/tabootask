import {env} from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async (event) => {
    if (env.MOCK_DB !== 'true') {
        error(418, {message: "I'm a teapot"});
    }

    const db = event.locals.db;

    return db.mockDb;
};