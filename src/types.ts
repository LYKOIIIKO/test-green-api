export type TCredentials = {
	idInstance: string;
	apiTokenInstance: string;
};

// Чат в списке: MAX chatId — числовой id, имя берём из checkAccount (или сам chatId)
export type TChat = {
	chatId: string;
	name: string;
};

// Сообщение в ленте: timestamp в миллисекундах, isOwn — своё (справа), чужое (слева)
export type TMessage = {
	id: string;
	chatId: string;
	text: string;
	isOwn: boolean;
	timestamp: number;
};
