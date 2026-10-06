// Modules
import { useEffect, useMemo, useState } from "react"
// Components
import { Sidebar } from "@/widgets/Sidebar"
import { ChatWindow } from "@/widgets/ChatWindow"
import { NewChatModal } from "@/features/NewChatModal"
// Api
import { createGreenApi } from "@/api/greenApi"
// Consts
import { CHAT_HISTORY_POLL_INTERVAL_MS, GREEN_API_URL } from "@/consts"
// Types
import { TChat, TMessage } from "@/types"
import { TChatPageProps } from "./types"
// Styles
import styles from "./ChatPage.module.css"

export const ChatPage = ({ credentials }: TChatPageProps) => {
	const [chats, setChats] = useState<TChat[]>([])
	const [activeChatId, setActiveChatId] = useState<string | null>(null)
	const [messagesByChat, setMessagesByChat] = useState<Record<string, TMessage[]>>({})
	const [isNewChatOpen, setIsNewChatOpen] = useState(false)
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

	useEffect(() => {
		let isMounted = true

		const loadChats = async () => {
			const serverChats = await api.getChats()
			if (!isMounted) {
				return
			}

			setChats(
				serverChats.map((chat) => ({
					chatId: chat.chatId,
					name: chat.name || chat.chatId,
				})),
			)
		}

		void loadChats()

		return () => {
			isMounted = false
		}
	}, [api])

	useEffect(() => {
		if (!activeChatId) {
			return
		}

		let isStopped = false

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
							const exists = merged.some((message) => message.id === item.id || (message.text === item.text && message.chatId === item.chatId && message.timestamp === item.timestamp))
							if (!exists) {
								merged.push(item)
							}
						}
						return {
							...prev,
							[activeChatId]: merged,
						}
					})
				} catch {
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
		setChats((prev) => [...prev, chat])
		setIsNewChatOpen(false)
	}

	const handleSend = async (text: string) => {
		if (!activeChat) {
			return
		}
		const chatId = activeChat.chatId
		const { idMessage } = await api.sendMessage({ chatId, message: text })
		setMessagesByChat((prev) => ({
			...prev,
			[chatId]: [...(prev[chatId] ?? []), { id: idMessage, chatId, text, isOwn: true, timestamp: Date.now() }],
		}))
	}

	const rootClass = activeChat ? `${styles.Root} ${styles.RootChatOpen}` : styles.Root

	return (
		<div className={rootClass}>
			<div className={styles.SidebarPane}>
				<Sidebar chats={chats} activeChatId={activeChatId} onNewChat={() => setIsNewChatOpen(true)} onSelectChat={setActiveChatId} />
			</div>
			{activeChat ? <ChatWindow chat={activeChat} messages={activeMessages} onBack={() => setActiveChatId(null)} onSend={handleSend} /> : <div className={styles.Placeholder} />}
			<NewChatModal open={isNewChatOpen} api={api} onClose={() => setIsNewChatOpen(false)} onChatCreated={handleChatCreated} />
		</div>
	)
}
