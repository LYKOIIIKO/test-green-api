export type TCredentials = {
	idInstance: string
	apiTokenInstance: string
}

export type TChat = {
	chatId: string
	name: string
}

export type TMessage = {
	id: string
	chatId: string
	text: string
	isOwn: boolean
	timestamp: number
}

export type TMessageTextSource = {
	messageData?: { textMessageData?: { textMessage?: string }; extendedTextMessageData?: { text?: string } }
	textMessageData?: { textMessage?: string }
	extendedTextMessageData?: { text?: string }
	textMessage?: string
	extendedTextMessage?: string | { text?: string }
	caption?: string
}
