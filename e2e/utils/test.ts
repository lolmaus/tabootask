import {test as base} from '@playwright/test';

export interface MyTestArgs {
    baseURL: string;
}

export const test = base.extend<MyTestArgs>({});
