import { defineConfig } from '@playwright/test';

export const playwrightBaseConfig = {
	testDir: 'e2e',

	use: {
		testIdAttribute: 'data-qa',
	},
}

export default defineConfig(playwrightBaseConfig, {
	use: {
		baseURL: 'http://localhost:4173',
	},
	webServer: {
		command: 'MOCK_DB=true MOCK_AUTH=true pnpm run build && pnpm run preview',
		port: 4173
	},
});
