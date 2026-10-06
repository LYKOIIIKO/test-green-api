// Modules
import { FormEvent, useState } from "react"
// Components
import { Button, Modal, Text, TextInput } from "@gravity-ui/uikit"
// Types
import { TNewChatModalProps } from "./types"
// Styles
import styles from "./NewChatModal.module.css"

export const NewChatModal = ({ open, api, onClose, onChatCreated }: TNewChatModalProps) => {
	const [phone, setPhone] = useState("")
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	const digits = phone.replace(/\D/g, "")
	const isEmpty = !digits.length

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (isEmpty) {
			setError("Введите номер телефона")
			return
		}

		setError("")
		setIsLoading(true)
		try {
			const account = await api.checkAccount({ phoneNumber: Number(digits) })
			if (!account.exist) {
				setError("Контакт не найден в MAX")
				return
			}
			onChatCreated({ chatId: account.chatId, name: account.name ?? account.chatId })
			setPhone("")
		} catch {
			setError("Не удалось проверить номер. Попробуйте ещё раз")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Modal open={open} onOpenChange={onClose} data-qa="new-chat-modal">
			<form className={styles.Form} onSubmit={handleSubmit}>
				<Text variant="subheader-1">Новый чат</Text>
				<TextInput
					placeholder="Номер телефона"
					type="tel"
					value={phone}
					onUpdate={(value) => setPhone(value)}
					size="m"
					autoFocus
					validationState={error ? "invalid" : undefined}
					errorMessage={error || undefined}
					qa="new-chat-phone-input"
				/>
				<div className={styles.Actions}>
					<Button view="normal" size="m" type="button" onClick={onClose}>
						Отмена
					</Button>
					<Button view="action" size="m" type="submit" loading={isLoading}>
						Создать
					</Button>
				</div>
			</form>
		</Modal>
	)
}
