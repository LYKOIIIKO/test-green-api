import { TChat } from "@/shared/types";

export type TSidebarProps = {
  chats: TChat[];
  activeChatId: string | null;
  error?: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onLogout: () => void;
};
