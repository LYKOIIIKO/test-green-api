import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { createGreenApi } from './greenApi';

const API_CONFIG = {
  apiUrl: 'https://3100.api.green-api.com',
  idInstance: '3100000001',
  apiTokenInstance: 'secret-token',
};

describe('createGreenApi().sendMessage', () => {
  it('отправляет POST на URL метода инстанса с телом {chatId, message} и возвращает idMessage', async () => {
    let requestedUrl = '';
    let requestedBody: unknown = null;

    server.use(
      http.post(
        'https://3100.api.green-api.com/waInstance3100000001/sendMessage/secret-token',
        async ({ request }) => {
          requestedUrl = request.url;
          requestedBody = await request.json();
          return HttpResponse.json({ idMessage: 'msg-1' });
        },
      ),
    );

    const api = createGreenApi(API_CONFIG);
    const result = await api.sendMessage({
      chatId: '10000000',
      message: 'Привет',
    });

    expect(requestedUrl).toBe(
      'https://3100.api.green-api.com/waInstance3100000001/sendMessage/secret-token',
    );
    expect(requestedBody).toEqual({ chatId: '10000000', message: 'Привет' });
    expect(result).toEqual({ idMessage: 'msg-1' });
  });
});

describe('createGreenApi().getChatHistory', () => {
  it('отправляет POST c JSON body и правильно нормализует текстовые сообщения истории', async () => {
    let requestedUrl = '';
    let requestedMethod = '';
    let requestedBody: unknown = null;

    server.use(
      http.post(
        'https://3100.api.green-api.com/waInstance3100000001/getChatHistory/secret-token',
        async ({ request }) => {
          requestedUrl = request.url;
          requestedMethod = request.method;
          requestedBody = await request.json();

          return HttpResponse.json([
            {
              idMessage: 'msg-1',
              type: 'outgoing',
              timestamp: 1754999812,
              textMessage: 'Привет из GREEN-API',
              senderData: { chatId: '10000000' },
            },
            {
              idMessage: 'msg-2',
              type: 'incoming',
              timestamp: 1754986980,
              textMessageData: { textMessage: 'Ответ клиенту' },
              senderData: { chatId: '10000000' },
            },
            {
              idMessage: 'msg-3',
              type: 'incoming',
              timestamp: 1755000000123,
              textMessage: 'Timestamp уже в миллисекундах',
              senderData: { chatId: '10000000' },
            },
          ]);
        },
      ),
    );

    const api = createGreenApi(API_CONFIG);
    const result = await api.getChatHistory({ chatId: '10000000', count: 10 });

    expect(requestedUrl).toBe(
      'https://3100.api.green-api.com/waInstance3100000001/getChatHistory/secret-token',
    );
    expect(requestedMethod).toBe('POST');
    expect(requestedBody).toEqual({ chatId: '10000000', count: 10 });
    expect(result).toEqual([
      {
        id: 'msg-1',
        chatId: '10000000',
        text: 'Привет из GREEN-API',
        isOwn: true,
        timestamp: 1754999812000,
      },
      {
        id: 'msg-2',
        chatId: '10000000',
        text: 'Ответ клиенту',
        isOwn: false,
        timestamp: 1754986980000,
      },
      {
        id: 'msg-3',
        chatId: '10000000',
        text: 'Timestamp уже в миллисекундах',
        isOwn: false,
        timestamp: 1755000000123,
      },
    ]);
  });
});

it('реальный payload GREEN API: типы incoming/outgoing и extendedTextMessage нормализуются корректно', async () => {
  server.use(
    http.post(
      'https://3100.api.green-api.com/waInstance3100000001/getChatHistory/secret-token',
      () =>
        HttpResponse.json([
          {
            type: 'incoming',
            idMessage: 'msg-doc-1',
            timestamp: 1754986980,
            typeMessage: 'textMessage',
            chatId: '10000000',
            textMessage: 'Ответ из доки',
            senderId: '10000000',
            senderName: 'Ходабрыш Пробешёлов',
            senderType: 'user',
          },
          {
            type: 'outgoing',
            idMessage: 'msg-doc-2',
            timestamp: 1754999812,
            typeMessage: 'extendedTextMessage',
            chatId: '10000000',
            textMessage: 'Я использую GREEN-API!',
            extendedTextMessage: {
              text: 'Я использую GREEN-API!',
            },
            statusMessage: 'delivered',
            sendByApi: true,
          },
        ]),
    ),
  );

  const api = createGreenApi(API_CONFIG);
  const result = await api.getChatHistory({ chatId: '10000000', count: 10 });

  expect(result).toEqual([
    {
      id: 'msg-doc-1',
      chatId: '10000000',
      text: 'Ответ из доки',
      isOwn: false,
      timestamp: 1754986980000,
    },
    {
      id: 'msg-doc-2',
      chatId: '10000000',
      text: 'Я использую GREEN-API!',
      isOwn: true,
      timestamp: 1754999812000,
    },
  ]);
});
