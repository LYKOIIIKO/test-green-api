// Modules
import { useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
// Pages
import { LoginPage } from '@/pages/LoginPage';
import { ChatPage } from '@/pages/ChatPage';
// Consts
import { LOCAL_STORAGE_CREDENTIALS_KEY } from '@/shared/consts';
// Types
import { TCredentials } from './types';
// Utils
import { readStoredCredentials } from '@/shared/utils';

export const App = () => {
  const [credentials, setCredentials] = useState<TCredentials | null>(readStoredCredentials);

  const handleLogin = (nextCredentials: TCredentials) => {
    localStorage.setItem(LOCAL_STORAGE_CREDENTIALS_KEY, JSON.stringify(nextCredentials));
    setCredentials(nextCredentials);
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_CREDENTIALS_KEY);
    setCredentials(null);
  };

  let screen = <LoginPage onLogin={handleLogin} />;
  if (credentials) {
    screen = <ChatPage credentials={credentials} onLogout={handleLogout} />;
  }
  return <ThemeProvider theme="light">{screen}</ThemeProvider>;
};
