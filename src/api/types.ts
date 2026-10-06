export type TGreenApiConfig = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

export type TSendMessageParams = {
  chatId: string;
  message: string;
};

export type TSendMessageResponse = {
  idMessage: string;
};

export type TGetStateInstanceResponse = {
  stateInstance: string;
};

export type TCheckAccountParams = {
  phoneNumber: number;
};

export type TCheckAccountResponse = {
  exist: boolean;
  chatId: string;
  name?: string;
};

export type TChatListItem = {
  chatId: string;
  name: string;
  type?: string;
  phoneNumber?: number;
};

export type TGetChatsResponse = TChatListItem[];

export type TChatHistoryExtendedTextMessage = {
  text?: string;
  description?: string;
  title?: string;
  jpegThumbnail?: string;
  isForwarded?: boolean;
  forwardingScore?: number;
};

export type TChatHistoryPollOption = {
  optionName?: string;
};

export type TChatHistoryPollMessageData = {
  name?: string;
  options?: TChatHistoryPollOption[];
  allowToChangeAnswer?: boolean;
};

export type TChatHistoryQuotedMessage = {
  stanzaId?: string;
  participant?: string;
  typeMessage?: string;
};

export type TChatHistoryMessageData = {
  typeMessage?: string;
  textMessageData?: { textMessage?: string };
  extendedTextMessageData?: { text?: string };
  pollMessageData?: TChatHistoryPollMessageData;
  quotedMessage?: TChatHistoryQuotedMessage;
};

export type TChatHistorySenderData = {
  chatId?: string;
  chatName?: string;
  senderName?: string;
  sender?: string;
};

export type TChatHistoryItem = {
  type?: "incoming" | "outgoing" | string;
  idMessage?: string;
  id?: string;
  chatId?: string;
  timestamp?: number;
  typeMessage?: string;
  textMessage?: string;
  caption?: string;
  fileName?: string;
  downloadUrl?: string;
  downloadUrlJpeg?: string;
  jpegThumbnail?: string;
  mimeType?: string;
  isAnimated?: boolean;
  senderId?: string;
  senderName?: string;
  senderType?: string;
  senderContactName?: string;
  sendByApi?: boolean;
  statusMessage?: string;
  chatType?: string;
  extendedTextMessage?: TChatHistoryExtendedTextMessage;
  extendedTextMessageData?: { text?: string };
  pollMessageData?: TChatHistoryPollMessageData;
  quotedMessage?: TChatHistoryQuotedMessage;
  messageData?: TChatHistoryMessageData;
  senderData?: TChatHistorySenderData;
  body?: {
    typeWebhook?: string;
    timestamp?: number;
    messageData?: TChatHistoryMessageData;
    senderData?: TChatHistorySenderData;
    type?: string;
    chatId?: string;
    sendByApi?: boolean;
  };
};

export type TGetChatHistoryResponse = TChatHistoryItem[];
