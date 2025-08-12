import { test as base } from '@playwright/test';
import { MY_FIXTURES } from './types';

export const test = base.extend<MY_FIXTURES>({
    baseURL: 'http://localhost:3000',
});
