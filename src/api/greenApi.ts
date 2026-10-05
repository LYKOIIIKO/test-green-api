import axios from "axios"
import { TMessage } from "@/types"
import {
	TCheckAccountParams,
	TCheckAccountResponse,
	TGetChatHistoryResponse,
	TGetChatsResponse,
	TGetStateInstanceResponse,
	TGreenApiConfig,
	TSendMessageParams,
	TSendMessageResponse,
} from "./types"

const normalizeTimestamp = (value?: number): number => {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return 0
	}

	return value > 1_000_000_000_000 ? value : value * 1000
}

const extractTextFromMessage = (
	payload?: {
		messageData?: { textMessageData?: { textMessage?: string }; extendedTextMessageData?: { text?: string } }
		textMessageData?: { textMessage?: string }
		extendedTextMessageData?: { text?: string }
		textMessage?: string
		extendedTextMessage?: string
		caption?: string
	} | null,
): string => {
	if (!payload) {
		return ""
	}

	return (
		payload.messageData?.textMessageData?.textMessage ??
		payload.messageData?.extendedTextMessageData?.text ??
		payload.textMessageData?.textMessage ??
		payload.extendedTextMessageData?.text ??
		payload.textMessage ??
		payload.extendedTextMessage ??
		payload.caption ??
		""
	)
}

// Фабрика клиента GREEN-API: путь всегда /waInstance{id}/{method}/{token}
export const createGreenApi = (config: TGreenApiConfig) => {
	const { apiUrl, idInstance, apiTokenInstance } = config
	const instance = axios.create({ baseURL: apiUrl })

	return {
		sendMessage: async (params: TSendMessageParams): Promise<TSendMessageResponse> => {
			const { data } = await instance.post<TSendMessageResponse>(`/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, params)
			return data
		},

		// Проверка кредов: неверный токен ответит ошибкой, валидный — состоянием инстанса
		getStateInstance: async (): Promise<TGetStateInstanceResponse> => {
			const { data } = await instance.get<TGetStateInstanceResponse>(`/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`)
			return data
		},

		// Проверка номера: есть ли собеседник в MAX и какой у него chatId
		checkAccount: async (params: TCheckAccountParams): Promise<TCheckAccountResponse> => {
			const { data } = await instance.post<TCheckAccountResponse>(`/waInstance${idInstance}/checkAccount/${apiTokenInstance}`, params)
			return data
		},

		getChats: async (): Promise<TGetChatsResponse> => {
			const { data } = await instance.get<TGetChatsResponse>(`/waInstance${idInstance}/getChats/${apiTokenInstance}`)
			return data ?? []
		},

		getChatHistory: async ({ chatId, count }: { chatId: string; count?: number }): Promise<TMessage[]> => {
			try {
				const { data } = await instance.post<TGetChatHistoryResponse>(`/waInstance${idInstance}/getChatHistory/${apiTokenInstance}`, { chatId, count })

				const rawItems = data ?? []

				return rawItems
					.map((item) => {
						const payload = item.body ?? item
						const text = extractTextFromMessage(payload) || extractTextFromMessage(item)
						if (!text) {
							return null
						}

						const timestamp = normalizeTimestamp(payload.timestamp ?? item.timestamp)
						const sender = payload.senderData ?? item.senderData
						const itemType = String(payload.type ?? item.type ?? "").toLowerCase()
						const isOwn = itemType === "outgoing" || payload.sendByApi === true || item.sendByApi === true

						return {
							id: String(item.idMessage ?? item.id ?? `${chatId}-${timestamp}-${text}`),
							chatId: payload.chatId ?? item.chatId ?? sender?.chatId ?? sender?.sender ?? chatId,
							text,
							isOwn,
							timestamp,
						}
					})
					.filter((message): message is TMessage => message !== null)
			} catch (error) {
				if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) {
					return []
				}
				return []
			}
		},
	}
}

export type TGreenApi = ReturnType<typeof createGreenApi>
