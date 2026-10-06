// Types
import { TChat, TMessage } from '@/shared/types';

export type TChatWindowProps = {
  chat: TChat;
  messages: TMessage[];
  hasHistoryError?: boolean;
  onBack: () => void;
  onSend: (text: string) => Promise<void>;
};
