// Modules
import { Plus, Power } from '@gravity-ui/icons';
import { Button, Icon, Text } from '@gravity-ui/uikit';
// Types
import { TSidebarProps } from './types';
// Styles
import styles from './Sidebar.module.css';

export const Sidebar = ({
  chats,
  activeChatId,
  error,
  onNewChat,
  onSelectChat,
  onLogout,
}: TSidebarProps) => {
  let content = (
    <Text className={styles.Empty} color="secondary">
      Нет чатов. Нажмите +, чтобы создать
    </Text>
  );
  if (error) {
    content = (
      <Text className={styles.Empty} color="danger">
        {error}
      </Text>
    );
  } else if (chats.length) {
    content = (
      <ul className={styles.ChatList}>
        {chats.map((chat) => {
          const isActive = chat.chatId === activeChatId;
          return (
            <li
              key={chat.chatId}
              className={isActive ? `${styles.ChatItem} ${styles.ChatItemActive}` : styles.ChatItem}
              onClick={() => onSelectChat(chat.chatId)}
              data-qa="chat-list-item"
            >
              <div className={styles.Avatar}>{chat.name.slice(0, 1).toUpperCase()}</div>
              <Text className={styles.ChatName} ellipsis>
                {chat.name}
              </Text>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <aside className={styles.Root} data-qa="sidebar">
      <header className={styles.Header}>
        <Text variant="header-2">Чаты</Text>
        <div className={styles.HeaderActions}>
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
          <Button
            view="flat"
            size="m"
            pin="circle-circle"
            onlyIcon
            aria-label="Выйти"
            onClick={onLogout}
            qa="logout-button"
          >
            <Icon data={Power} size={18} />
          </Button>
        </div>
      </header>

      {content}
    </aside>
  );
};
