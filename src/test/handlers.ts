import { http, HttpResponse } from "msw"

// Дефолтные обработчики: список чатов и история по умолчанию пустые,
// чтобы UI-тесты не падали от unhandled request.
export const handlers = [
	http.get("*/waInstance*/getChats/*", () => {
		return HttpResponse.json([])
	}),
	http.post("*/waInstance*/getChatHistory/*", () => {
		return HttpResponse.json([])
	}),
]
