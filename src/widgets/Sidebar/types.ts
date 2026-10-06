import { TChat } from "@/types";

export type TSidebarProps = {
  chats: TChat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
};
