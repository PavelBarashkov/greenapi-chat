export type Credentials = {
  apiUrl: string

  idInstance: string
  apiTokenInstance: string
}

export type InstanceState =
  'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting' | 'suspended' | 'yellowCard'

export type SendMessageRequest = { chatId: string; message: string }
export type SendMessageResponse = { idMessage: string }

export type ApiChat = { id: string; name: string; type: string; archive: boolean }
export type ChatHistoryEntry = {
  type: 'incoming' | 'outgoing'
  idMessage: string
  timestamp: number
  typeMessage: string
  chatId: string
  textMessage?: string
}

export type ReceivedNotification = {
  receiptId: number

  body: NotificationBody
}

type InstanceData = { idInstance: number; wid: string; typeInstance: string }
type SenderData = {
  chatId: string
  sender: string
  chatName?: string
  senderName?: string
  senderContactName?: string
}

export type TextMessageData = {
  typeMessage: 'textMessage'
  textMessageData: { textMessage: string; isTemplateMessage?: boolean }
}
export type ExtendedTextMessageData = {
  typeMessage: 'extendedTextMessage' | 'quotedMessage'
  extendedTextMessageData: { text: string; description?: string; title?: string }
}

export type OtherMessageData = { typeMessage: string }

export type MessageData = TextMessageData | ExtendedTextMessageData | OtherMessageData

export type IncomingMessageNotification = {
  typeWebhook: 'incomingMessageReceived'
  instanceData: InstanceData

  timestamp: number
  idMessage: string
  senderData: SenderData
  messageData: MessageData
}

export type OutgoingMessageNotification = {
  typeWebhook: 'outgoingMessageReceived' | 'outgoingAPIMessageReceived'
  instanceData: InstanceData
  timestamp: number
  idMessage: string

  senderData: SenderData
  messageData: MessageData
}

export type OutgoingStatusNotification = {
  typeWebhook: 'outgoingMessageStatus'
  instanceData: InstanceData
  timestamp: number
  idMessage: string

  chatId: string
  status:
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed'
    | 'noAccount'
    | 'notInGroup'
    | 'suspended'
    | 'yellowCard'
  sendByApi?: boolean
  description?: string
}

export type StateChangedNotification = {
  typeWebhook: 'stateInstanceChanged'
  instanceData: InstanceData
  timestamp: number
  stateInstance: InstanceState
}

export type UnknownNotification = { typeWebhook: string }

export type NotificationBody =
  | IncomingMessageNotification
  | OutgoingMessageNotification
  | OutgoingStatusNotification
  | StateChangedNotification
  | UnknownNotification
