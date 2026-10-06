import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { LOCAL_STORAGE_CREDENTIALS_KEY } from "@/shared/consts";
import { App } from "@/App";

const login = () => {
  localStorage.setItem(
    LOCAL_STORAGE_CREDENTIALS_KEY,
    JSON.stringify({
      idInstance: "3100000001",
      apiTokenInstance: "secret-token",
    }),
  );
};

it("загрузка чатов при старте: getChats показывает список без ручного создания", async () => {
  server.use(
    http.get(
      "https://3100.api.green-api.com/waInstance3100000001/getChats/secret-token",
      () =>
        HttpResponse.json([
          {
            chatId: "10000000",
            name: "Иван",
            type: "user",
            phoneNumber: 79991234567,
          },
        ]),
    ),
  );

  login();
  render(<App />);

  expect(await screen.findByText("Иван")).toBeInTheDocument();
});

const createAndOpenChat = async (name = "Иван") => {
  server.use(
    http.post(
      "https://3100.api.green-api.com/waInstance3100000001/checkAccount/secret-token",
      () => HttpResponse.json({ exist: true, chatId: "10000000", name }),
    ),
  );

  await userEvent.click(screen.getByRole("button", { name: "Новый чат" }));
  await userEvent.type(
    screen.getByPlaceholderText("+7 (999) 123-45-67"),
    "79991234567",
  );
  await userEvent.click(screen.getByRole("button", { name: "Создать" }));
  await userEvent.click(await screen.findByText(name));
};

it("создание чата: checkAccount нашёл номер — чат появляется в списке", async () => {
  let requestBody: unknown = null;

  server.use(
    http.post(
      "https://3100.api.green-api.com/waInstance3100000001/checkAccount/secret-token",
      async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          exist: true,
          chatId: "10000000",
          name: "Иван",
        });
      },
    ),
  );

  login();
  render(<App />);

  await userEvent.click(screen.getByRole("button", { name: "Новый чат" }));
  await userEvent.type(
    screen.getByPlaceholderText("+7 (999) 123-45-67"),
    "+7 (999) 123-45-67",
  );
  await userEvent.click(screen.getByRole("button", { name: "Создать" }));

  expect(await screen.findByText("Иван")).toBeInTheDocument();
  expect(requestBody).toEqual({ phoneNumber: 79991234567 });
});

it("создание чата: checkAccount не нашёл номер — показывает ошибку, чат не создаётся", async () => {
  server.use(
    http.post(
      "https://3100.api.green-api.com/waInstance3100000001/checkAccount/secret-token",
      () => HttpResponse.json({ exist: false, chatId: "" }),
    ),
  );

  login();
  render(<App />);

  await userEvent.click(screen.getByRole("button", { name: "Новый чат" }));
  await userEvent.type(
    screen.getByPlaceholderText("+7 (999) 123-45-67"),
    "70000000000",
  );
  await userEvent.click(screen.getByRole("button", { name: "Создать" }));

  expect(
    await screen.findByText("Контакт не найден в MAX"),
  ).toBeInTheDocument();
  expect(screen.queryByTestId("chat-list-item")).not.toBeInTheDocument();
});

it("кнопка «назад» из открытого чата возвращает к списку чатов", async () => {
  server.use(
    http.post(
      "https://3100.api.green-api.com/waInstance3100000001/checkAccount/secret-token",
      () =>
        HttpResponse.json({ exist: true, chatId: "10000000", name: "Иван" }),
    ),
  );

  login();
  render(<App />);

  await userEvent.click(screen.getByRole("button", { name: "Новый чат" }));
  await userEvent.type(
    screen.getByPlaceholderText("+7 (999) 123-45-67"),
    "79991234567",
  );
  await userEvent.click(screen.getByRole("button", { name: "Создать" }));
  await userEvent.click(await screen.findByText("Иван"));

  expect(
    await screen.findByRole("button", { name: "Назад к чатам" }),
  ).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Назад к чатам" }));
  expect(
    screen.queryByRole("button", { name: "Назад к чатам" }),
  ).not.toBeInTheDocument();

  await userEvent.click(screen.getByText("Иван"));
  expect(
    await screen.findByRole("button", { name: "Назад к чатам" }),
  ).toBeInTheDocument();
});

it("отправка сообщения: текст появляется в ленте, поле очищается", async () => {
  let requestBody: unknown = null;

  server.use(
    http.get(
      "https://3100.api.green-api.com/waInstance3100000001/getChats/secret-token",
      () =>
        HttpResponse.json([{ chatId: "10000000", name: "Иван", type: "user" }]),
    ),
    http.post(
      "https://3100.api.green-api.com/waInstance3100000001/sendMessage/secret-token",
      async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ idMessage: "msg-1" });
      },
    ),
  );

  login();
  render(<App />);
  await createAndOpenChat();

  await userEvent.type(screen.getByPlaceholderText("Сообщение"), "Привет!");
  await userEvent.click(screen.getByRole("button", { name: "Отправить" }));

  expect(await screen.findByText("Привет!")).toBeInTheDocument();
  expect(requestBody).toEqual({ chatId: "10000000", message: "Привет!" });
  expect(screen.getByPlaceholderText("Сообщение")).toHaveValue("");
});

it("история чата отображается от старых сообщений к новым", async () => {
  server.use(
    http.post(
      "https://3100.api.green-api.com/waInstance3100000001/getChatHistory/secret-token",
      () =>
        HttpResponse.json([
          {
            idMessage: "new",
            type: "incoming",
            timestamp: 1754999812,
            textMessage: "Новое сообщение",
            senderData: { chatId: "10000000" },
          },
          {
            idMessage: "old",
            type: "incoming",
            timestamp: 1754986980,
            textMessage: "Старое сообщение",
            senderData: { chatId: "10000000" },
          },
        ]),
    ),
  );

  login();
  render(<App />);
  await createAndOpenChat();

  const messageTexts = screen
    .getAllByTestId("message-bubble")
    .map((message) => message.textContent);
  expect(messageTexts).toEqual(["Старое сообщение", "Новое сообщение"]);
});

it("ошибка отправки: текст остаётся в поле, показывается ошибка, лента пуста", async () => {
  server.use(
    http.post(
      "https://3100.api.green-api.com/waInstance3100000001/sendMessage/secret-token",
      () => HttpResponse.json({ error: "boom" }, { status: 500 }),
    ),
  );

  login();
  render(<App />);
  await createAndOpenChat();

  await userEvent.type(screen.getByPlaceholderText("Сообщение"), "Привет!");
  await userEvent.click(screen.getByRole("button", { name: "Отправить" }));

  expect(
    await screen.findByText("Не удалось отправить сообщение"),
  ).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Сообщение")).toHaveValue("Привет!");
  expect(screen.queryByTestId("message-bubble")).not.toBeInTheDocument();
});

it("история активного чата обновляется опросом getChatHistory каждые 10 секунд", async () => {
  let historyCalls = 0;

  server.use(
    http.post(
      "https://3100.api.green-api.com/waInstance3100000001/getChatHistory/secret-token",
      () => {
        historyCalls += 1;
        if (historyCalls < 2) {
          return HttpResponse.json([]);
        }

        return HttpResponse.json([
          {
            idMessage: "answer-1",
            type: "incoming",
            timestamp: 1759330001,
            textMessage: "Ответ",
            senderData: { chatId: "10000000" },
          },
        ]);
      },
    ),
  );

  login();
  render(<App />);
  await createAndOpenChat();

  expect(
    await screen.findByText("Ответ", {}, { timeout: 15000 }),
  ).toBeInTheDocument();
}, 20000);

it("ошибка загрузки чатов: getChats падает — в Sidebar показывается ошибка", async () => {
  server.use(
    http.get(
      "https://3100.api.green-api.com/waInstance3100000001/getChats/secret-token",
      () => HttpResponse.json({ message: "boom" }, { status: 500 }),
    ),
  );

  login();
  render(<App />);

  expect(
    await screen.findByText("Не удалось загрузить чаты"),
  ).toBeInTheDocument();
  expect(screen.queryByTestId("chat-list-item")).not.toBeInTheDocument();
});
