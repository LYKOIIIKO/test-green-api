import {TChat, TMessage} from '@/types';

export type TChatWindowProps = {
	chat: TChat;
	messages: TMessage[];
	onBack: () => void;
	onSend: (text: string) => Promise<void>;
};
