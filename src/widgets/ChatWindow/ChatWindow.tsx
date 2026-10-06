// Components
import { Button, Icon, Text } from "@gravity-ui/uikit"
import { ArrowLeft } from "@gravity-ui/icons"
import { MessageInput } from "@/features/MessageInput"
// Types
import { TChatWindowProps } from "./types"
// Styles
import styles from "./ChatWindow.module.css"

export const ChatWindow = ({ chat, messages, hasHistoryError, onBack, onSend }: TChatWindowProps) => {
	const chatMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp)

	return (
		<section className={styles.Root} data-qa="chat-window">
			<header className={styles.Header}>
				<Button view="flat" size="m" pin="circle-circle" onlyIcon aria-label="Назад к чатам" onClick={onBack} className={styles.BackButton} qa="chat-back-button">
					<Icon data={ArrowLeft} size={20} />
				</Button>
				<div className={styles.HeaderInfo}>
					<div className={styles.HeaderAvatar}>{chat.name.slice(0, 1).toUpperCase()}</div>
					<Text variant="subheader-1" ellipsis>
						{chat.name}
					</Text>
				</div>
			</header>

			<div className={styles.Messages} data-qa="chat-body">
				{hasHistoryError ? <Text color="danger">Не удалось обновить историю</Text> : null}
				{chatMessages.length ? (
					chatMessages.map((message) => (
						<div key={message.id} className={message.isOwn ? `${styles.Message} ${styles.MessageOwn}` : styles.Message} data-qa="message-bubble">
							<span className={styles.MessageText}>{message.text}</span>
						</div>
					))
				) : (
					<Text color="secondary">Сообщений пока нет</Text>
				)}
			</div>

			<MessageInput onSend={onSend} />
		</section>
	)
}
