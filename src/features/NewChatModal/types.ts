import { TGreenApi } from '@/shared/api/greenApi';
import { TChat } from '@/shared/types';

export type TNewChatModalProps = {
  open: boolean;
  api: TGreenApi;
  onClose: () => void;
  onChatCreated: (chat: TChat) => void;
};
