// Modules
import { useEffect, useMemo, useState } from "react"
// Components
import { Sidebar } from "@/widgets/Sidebar"
import { ChatWindow } from "@/widgets/ChatWindow"
import { NewChatModal } from "@/features/NewChatModal"
// Api
import { createGreenApi } from "@/shared/api/greenApi"
// Consts
import { CHAT_HISTORY_POLL_INTERVAL_MS, GREEN_API_URL } from "@/shared/consts"
// Types
import { TChat, TMessage } from "@/shared/types"
import { TChatPageProps } from "./types"
// Styles
import styles from "./ChatPage.module.css"

export const ChatPage = ({ credentials, onLogout }: TChatPageProps) => {
	const [chats, setChats] = useState<TChat[]>([])
	const [activeChatId, setActiveChatId] = useState<string | null>(null)
	const [messagesByChat, setMessagesByChat] = useState<Record<string, TMessage[]>>({})
	const [isNewChatOpen, setIsNewChatOpen] = useState(false)
	const [chatsError, setChatsError] = useState("")
	const [historyError, setHistoryError] = useState(false)
	const api = useMemo(
		() =>
			createGreenApi({
				apiUrl: GREEN_API_URL,
				idInstance: credentials.idInstance,
				apiTokenInstance: credentials.apiTokenInstance,
			}),
		[credentials],
	)
	const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null
	const activeMessages = activeChatId ? (messagesByChat[activeChatId] ?? []) : []

	const loadChats = async () => {
		try {
			const serverChats = await api.getChats()
			setChats(
				serverChats.map((chat) => ({
					chatId: chat.chatId,
					name: chat.name || chat.chatId,
				})),
			)
			setChatsError("")
		} catch {
			setChatsError("Не удалось загрузить чаты")
		}
	}

	useEffect(() => {
		void loadChats()
	}, [api])

	useEffect(() => {
		if (!activeChatId) {
			return
		}

		let isStopped = false

		setHistoryError(false)

		const pollHistory = async () => {
			while (!isStopped) {
				try {
					const history = await api.getChatHistory({ chatId: activeChatId })
					if (isStopped) {
						return
					}

					setMessagesByChat((prev) => {
						const existing = prev[activeChatId] ?? []
						const merged = [...existing]
						for (const item of history) {
							const exists = merged.some((message) => message.id === item.id)
							if (!exists) {
								merged.push(item)
							}
						}
						return {
							...prev,
							[activeChatId]: merged,
						}
					})
					setHistoryError(false)
				} catch {
					if (!isStopped) {
						setHistoryError(true)
					}
				}

				if (!isStopped) {
					await new Promise((resolve) => setTimeout(resolve, CHAT_HISTORY_POLL_INTERVAL_MS))
				}
			}
		}

		void pollHistory()

		return () => {
			isStopped = true
		}
	}, [activeChatId, api])

	const handleChatCreated = (chat: TChat) => {
		setChats((prev) => (prev.some((item) => item.chatId === chat.chatId) ? prev : [...prev, chat]))
		setIsNewChatOpen(false)
	}

	const handleSend = async (text: string) => {
		if (!activeChat) {
			return
		}
		const chatId = activeChat.chatId
		const { idMessage } = await api.sendMessage({ chatId, message: text })

		void loadChats()
		setMessagesByChat((prev) => ({
			...prev,
			[chatId]: [...(prev[chatId] ?? []), { id: idMessage, chatId, text, isOwn: true, timestamp: Date.now() }],
		}))
	}

	const rootClass = activeChat ? `${styles.Root} ${styles.RootChatOpen}` : styles.Root

	return (
		<div className={rootClass}>
			<div className={styles.SidebarPane}>
				<Sidebar chats={chats} activeChatId={activeChatId} error={chatsError} onNewChat={() => setIsNewChatOpen(true)} onSelectChat={setActiveChatId} onLogout={onLogout} />
			</div>
			{activeChat ? (
				<ChatWindow chat={activeChat} messages={activeMessages} hasHistoryError={historyError} onBack={() => setActiveChatId(null)} onSend={handleSend} />
			) : (
				<div className={styles.Placeholder} />
			)}
			<NewChatModal open={isNewChatOpen} api={api} onClose={() => setIsNewChatOpen(false)} onChatCreated={handleChatCreated} />
		</div>
	)
}
