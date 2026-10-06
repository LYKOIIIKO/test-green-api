import { TGreenApi } from "@/api/greenApi";
import { TChat } from "@/types";

export type TNewChatModalProps = {
  open: boolean;
  api: TGreenApi;
  onClose: () => void;
  onChatCreated: (chat: TChat) => void;
};
