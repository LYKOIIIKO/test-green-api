// Consts
import { LOCAL_STORAGE_CREDENTIALS_KEY } from "@/consts"
// Types
import { TCredentials, TMessageTextSource } from "@/types"

export const normalizeTimestamp = (value?: number): number => {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return 0
	}

	return value > 1000000000000 ? value : value * 1000
}

export const extractTextFromMessage = (payload?: TMessageTextSource | null): string => {
	if (!payload) {
		return ""
	}

	const extendedText = typeof payload.extendedTextMessage === "string" ? payload.extendedTextMessage : payload.extendedTextMessage?.text

	return (
		payload.messageData?.textMessageData?.textMessage ??
		payload.messageData?.extendedTextMessageData?.text ??
		payload.textMessageData?.textMessage ??
		payload.extendedTextMessageData?.text ??
		payload.textMessage ??
		extendedText ??
		payload.caption ??
		""
	)
}

export const isCredentials = (value: unknown): value is TCredentials => {
	if (typeof value !== "object" || value === null) {
		return false
	}
	if (!("idInstance" in value) || !("apiTokenInstance" in value)) {
		return false
	}
	return typeof value.idInstance === "string" && typeof value.apiTokenInstance === "string"
}

export const readStoredCredentials = (): TCredentials | null => {
	const raw = localStorage.getItem(LOCAL_STORAGE_CREDENTIALS_KEY)
	if (!raw) {
		return null
	}
	try {
		const parsed: unknown = JSON.parse(raw)
		return isCredentials(parsed) ? parsed : null
	} catch {
		return null
	}
}
