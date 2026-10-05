// Modules
import {FormEvent, useState} from 'react';
// Components
import {Button, Modal, Text, TextInput} from '@gravity-ui/uikit';
// Types
import {TNewChatModalProps} from './types';
// Styles
import styles from './NewChatModal.module.css';

export const NewChatModal = ({open, api, onClose, onChatCreated}: TNewChatModalProps) => {
	// 1. state
	const [phone, setPhone] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// Сырые цифры номера — ровно то, что уходит в checkAccount
	const digits = phone.replace(/\D/g, '');
	const isEmpty = !digits.length;

	// 6. handlers: ищем собеседника в MAX и создаём чат
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isEmpty) {
			setError('Введите номер телефона');
			return;
		}

		setError('');
		setIsLoading(true);
		try {
			const account = await api.checkAccount({phoneNumber: Number(digits)});
			// Номера нет в MAX — показываем ошибку, чат не создаём
			if (!account.exist) {
				setError('Контакт не найден в MAX');
				return;
			}
			onChatCreated({chatId: account.chatId, name: account.name ?? account.chatId});
			setPhone('');
		} catch {
			setError('Не удалось проверить номер. Попробуйте ещё раз');
		} finally {
			setIsLoading(false);
		}
	};

	// 7. render
	return (
		<Modal open={open} onClose={onClose} data-qa="new-chat-modal">
			<form className={styles.Form} onSubmit={handleSubmit}>
				<Text variant="subheader-1">Новый чат</Text>
				<TextInput
					placeholder="Номер телефона"
					type="tel"
					value={phone}
					onUpdate={(value) => setPhone(value)}
					size="m"
					autoFocus
					validationState={error ? 'invalid' : undefined}
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
	);
};
