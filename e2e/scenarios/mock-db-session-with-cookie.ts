import { BrowserContext } from "@playwright/test";
import {generateMockDbSessionId} from '../../src/lib/hooks/utils/mock-db-session-id';
import { setMockDbCookie } from "../utils/cookies";

export const mockDbSessionWithCookie = async ({baseURL, context}: {baseURL: string, context: BrowserContext}): Promise<string> => {
    const mockDbSessionId = generateMockDbSessionId();

    setMockDbCookie({baseURL, context}, mockDbSessionId);

    return mockDbSessionId;
}
