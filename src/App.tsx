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
// Utils
import {readStoredCredentials} from '@/utils';

export const App = () => {
	const [credentials, setCredentials] = useState<TCredentials | null>(readStoredCredentials);

	const handleLogin = (nextCredentials: TCredentials) => {
		localStorage.setItem(LOCAL_STORAGE_CREDENTIALS_KEY, JSON.stringify(nextCredentials));
		setCredentials(nextCredentials);
	};

	let screen = <LoginPage onLogin={handleLogin} />;
	if (credentials) {
		screen = <ChatPage credentials={credentials} />;
	}
	return <ThemeProvider theme="light">{screen}</ThemeProvider>;
};
