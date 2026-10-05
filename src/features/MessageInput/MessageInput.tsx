// Modules
import {FormEvent, useState} from 'react';
// Components
import {Button, Icon, Text, TextInput} from '@gravity-ui/uikit';
import {ArrowUp} from '@gravity-ui/icons';
// Types
import {TMessageInputProps} from './types';
// Styles
import styles from './MessageInput.module.css';

export const MessageInput = ({onSend}: TMessageInputProps) => {
	// 1. state
	const [text, setText] = useState('');
	const [error, setError] = useState('');
	const [isSending, setIsSending] = useState(false);

	// 2. computed
	const trimmed = text.trim();
	const isEmpty = !trimmed.length;
	const shouldDisableSend = isEmpty || isSending;

	// 6. handlers: отправляем и чистим поле только при успехе
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (shouldDisableSend) {
			return;
		}

		setError('');
		setIsSending(true);
		try {
			await onSend(trimmed);
			// Поле чистим после успеха — иначе пользователь потеряет текст
			setText('');
		} catch {
			setError('Не удалось отправить сообщение');
		} finally {
			setIsSending(false);
		}
	};

	// 7. render
	return (
		<form className={styles.Root} onSubmit={handleSubmit} data-qa="message-input">
			<div className={styles.Pill}>
				<TextInput
					view="clear"
					placeholder="Сообщение"
					value={text}
					onUpdate={setText}
					size="m"
					qa="message-text-input"
				/>
				<Button
					view="action"
					size="m"
					pin="circle-circle"
					onlyIcon
					type="submit"
					disabled={shouldDisableSend}
					aria-label="Отправить"
					qa="message-send-button"
				>
					<Icon data={ArrowUp} size={18} />
				</Button>
			</div>
			{error ? (
				<Text color="danger" className={styles.Error}>
					{error}
				</Text>
			) : null}
		</form>
	);
};
