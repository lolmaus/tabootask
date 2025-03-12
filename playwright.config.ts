import { defineConfig } from '@playwright/test';

export const playwrightBaseConfig = {
	testDir: 'e2e',

	use: {
		testIdAttribute: 'data-qa',
	},
}

export default defineConfig(playwrightBaseConfig, {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
});
