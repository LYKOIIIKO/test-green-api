// Modules
import { Button, Modal, Text, TextInput } from '@gravity-ui/uikit';
import { FormEvent, useState } from 'react';
// Utils
import { normalizePhoneDigits } from '@/shared/utils';
// Consts
import { PHONE_INPUT_PLACEHOLDER } from '@/shared/consts';
// Types
import { TNewChatModalProps } from './types';
// Styles
import styles from './NewChatModal.module.css';

export const NewChatModal = ({ open, api, onClose, onChatCreated }: TNewChatModalProps) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const digits = phone.replace(/\D/g, '');
  const phoneDigits = normalizePhoneDigits(digits);
  const isEmpty = !digits.length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEmpty) {
      setError('Введите номер телефона');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const account = await api.checkAccount({
        phoneNumber: Number(phoneDigits),
      });
      if (!account.exist) {
        setError('Контакт не найден в MAX');
        return;
      }
      onChatCreated({
        chatId: account.chatId,
        name: account.name ?? account.chatId,
      });
      setPhone('');
    } catch {
      setError('Не удалось проверить номер. Попробуйте ещё раз');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose} data-qa="new-chat-modal">
      <form className={styles.Form} onSubmit={handleSubmit}>
        <Text variant="subheader-1">Новый чат</Text>
        <TextInput
          placeholder={PHONE_INPUT_PLACEHOLDER}
          type="tel"
          value={phone}
          onUpdate={setPhone}
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
