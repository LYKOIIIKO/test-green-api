import {useState} from 'react';
// Modules
import {ThemeProvider} from '@gravity-ui/uikit';
// Pages
import {LoginPage} from '@/pages/LoginPage';
import {ChatPage} from '@/pages/ChatPage';
// Consts
import {LOCAL_STORAGE_CREDENTIALS_KEY} from '@/consts';
// Types
import {TCredentials} from './types';

// Проверяем, что под ключом localStorage лежат настоящие креды, а не мусор
const isCredentials = (value: unknown): value is TCredentials => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	if (!('idInstance' in value) || !('apiTokenInstance' in value)) {
		return false;
	}
	return typeof value.idInstance === 'string' && typeof value.apiTokenInstance === 'string';
};

// Читаем креды из localStorage на старте — без них показываем форму входа
const readStoredCredentials = (): TCredentials | null => {
	const raw = localStorage.getItem(LOCAL_STORAGE_CREDENTIALS_KEY);
	if (!raw) {
		return null;
	}
	try {
		const parsed: unknown = JSON.parse(raw);
		return isCredentials(parsed) ? parsed : null;
	} catch {
		return null;
	}
};

export const App = () => {
	// 1. state: креды определяют, какой экран показан
	const [credentials, setCredentials] = useState<TCredentials | null>(readStoredCredentials);

	// 6. handlers: сохраняем креды и переходим на экран чатов
	const handleLogin = (nextCredentials: TCredentials) => {
		localStorage.setItem(LOCAL_STORAGE_CREDENTIALS_KEY, JSON.stringify(nextCredentials));
		setCredentials(nextCredentials);
	};

	// 7. render: ThemeProvider живёт здесь, чтобы и тест, и прод рендерили один корень
	let screen = <LoginPage onLogin={handleLogin} />;
	if (credentials) {
		screen = <ChatPage credentials={credentials} />;
	}
	return <ThemeProvider theme="light">{screen}</ThemeProvider>;
};
