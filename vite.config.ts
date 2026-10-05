import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		css: false,
		// gravity-ui отдаёт ESM с css-импортами — прогоняем его через vite-пайплайн
		server: {
			deps: {
				inline: ['@gravity-ui/uikit', '@gravity-ui/icons'],
			},
		},
	},
});
