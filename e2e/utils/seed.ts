import { Page } from "@playwright/test";
import { MockDbSchema } from "../../src/lib/server/db/db-mock";
import deepmergeFactory from '@fastify/deepmerge';

const deepmergeAll = deepmergeFactory({all: true});

const baseData: MockDbSchema = {
    users: [],
    sessions: [],
};

export const seedReplaceDb = async (page: Page, ...datas: Partial<MockDbSchema>[]): Promise<void> => {
    const data: MockDbSchema = deepmergeAll(baseData, ...datas);

    await page.request.post('/debug/db', {data});
}