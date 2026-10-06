import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/waInstance*/getChats/*", () => {
    return HttpResponse.json([]);
  }),
  http.post("*/waInstance*/getChatHistory/*", () => {
    return HttpResponse.json([]);
  }),
];
