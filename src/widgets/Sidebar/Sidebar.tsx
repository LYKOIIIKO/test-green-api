// Components
import { Button, Icon, Text } from "@gravity-ui/uikit";
import { Plus } from "@gravity-ui/icons";
// Types
import { TSidebarProps } from "./types";
// Styles
import styles from "./Sidebar.module.css";

export const Sidebar = ({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
}: TSidebarProps) => {
  return (
    <aside className={styles.Root} data-qa="sidebar">
      <header className={styles.Header}>
        <Text variant="header-2">Чаты</Text>
        <Button
          view="action"
          size="m"
          pin="circle-circle"
          onlyIcon
          aria-label="Новый чат"
          onClick={onNewChat}
          qa="new-chat-button"
        >
          <Icon data={Plus} size={18} />
        </Button>
      </header>

      {chats.length ? (
        <ul className={styles.ChatList}>
          {chats.map((chat) => {
            const isActive = chat.chatId === activeChatId;
            return (
              <li
                key={chat.chatId}
                className={
                  isActive
                    ? `${styles.ChatItem} ${styles.ChatItemActive}`
                    : styles.ChatItem
                }
                onClick={() => onSelectChat(chat.chatId)}
                data-qa="chat-list-item"
              >
                <div className={styles.Avatar}>
                  {chat.name.slice(0, 1).toUpperCase()}
                </div>
                <Text className={styles.ChatName} ellipsis>
                  {chat.name}
                </Text>
              </li>
            );
          })}
        </ul>
      ) : (
        <Text className={styles.Empty} color="secondary">
          Нет чатов. Нажмите +, чтобы создать
        </Text>
      )}
    </aside>
  );
};
