import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { LOCAL_STORAGE_CREDENTIALS_KEY } from '@/shared/consts';
import { App } from './App';

it('вход с кредовыми — сохраняет их в localStorage и открывает чаты', async () => {
  server.use(
    http.get(
      'https://3100.api.green-api.com/waInstance3100000001/getStateInstance/secret-token',
      () => HttpResponse.json({ stateInstance: 'authorized' }),
    ),
  );

  render(<App />);

  expect(screen.getByPlaceholderText('idInstance')).toBeInTheDocument();

  await userEvent.type(screen.getByPlaceholderText('idInstance'), '3100000001');
  await userEvent.type(screen.getByPlaceholderText('apiTokenInstance'), 'secret-token');
  await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

  expect(await screen.findByText('Чаты')).toBeInTheDocument();

  expect(localStorage.getItem(LOCAL_STORAGE_CREDENTIALS_KEY)).toBe(
    JSON.stringify({
      idInstance: '3100000001',
      apiTokenInstance: 'secret-token',
    }),
  );
});

it('выход: кнопка чистит креды и возвращает на экран входа', async () => {
  render(<App />);

  await userEvent.type(screen.getByPlaceholderText('idInstance'), '3100000001');
  await userEvent.type(screen.getByPlaceholderText('apiTokenInstance'), 'secret-token');
  await userEvent.click(screen.getByRole('button', { name: 'Войти' }));
  expect(await screen.findByText('Чаты')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Выйти' }));

  expect(screen.getByPlaceholderText('idInstance')).toBeInTheDocument();
  expect(localStorage.getItem(LOCAL_STORAGE_CREDENTIALS_KEY)).toBeNull();
});
