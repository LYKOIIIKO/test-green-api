import '@testing-library/jest-dom/vitest';
import {cleanup, configure} from '@testing-library/react';
import {afterEach, beforeAll, afterAll} from 'vitest';
import {server} from './server';

// У gravity-ui компоненты отдают data-qa — делаем его тестовым id
configure({testIdAttribute: 'data-qa'});

// jsdom не реализует matchMedia/ResizeObserver, которые используют gravity-ui и floating-ui
window.matchMedia = ((query: string) => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: () => {},
	removeListener: () => {},
	addEventListener: () => {},
	removeEventListener: () => {},
	dispatchEvent: () => false,
})) as typeof window.matchMedia;

globalThis.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Поднимаем msw-сервер до всех тестов: тесты ходят в API только через мок-обработчики
beforeAll(() => server.listen({onUnhandledRequest: 'error'}));
afterAll(() => server.close());

// После каждого теста убираем DOM, сбрасываем обработчики и хранилище кредов
afterEach(() => {
	cleanup();
	server.resetHandlers();
	localStorage.clear();
});
