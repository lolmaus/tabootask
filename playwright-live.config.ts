import { defineConfig } from '@playwright/test';
import { playwrightBaseConfig } from './playwright.config';

export default defineConfig(playwrightBaseConfig, {
	use: {
		baseURL: 'http://localhost:5173'
	}
});
