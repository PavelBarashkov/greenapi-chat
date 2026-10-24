import type { NotificationBody } from '@/shared/api'

export type IncomingText = {
  idMessage: string

  chatId: string
  text: string

  timestamp: number
}

type Json = Record<string, unknown>

const isRecord = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const nonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

function readText(messageData: Json): string | null {
  switch (messageData.typeMessage) {
    case 'textMessage':
      return isRecord(messageData.textMessageData)
        ? nonEmptyString(messageData.textMessageData.textMessage)
        : null
    case 'extendedTextMessage':
    case 'quotedMessage':
      return isRecord(messageData.extendedTextMessageData)
        ? nonEmptyString(messageData.extendedTextMessageData.text)
        : null
    default:
      return null
  }
}

const MAX_DATE_MS = 8.64e15

function timestampToMs(seconds: unknown): number {
  const isUsable =
    typeof seconds === 'number' &&
    Number.isSafeInteger(seconds) &&
    seconds > 0 &&
    seconds * 1000 <= MAX_DATE_MS
  return isUsable ? seconds * 1000 : Date.now()
}

export function toIncomingText(body: NotificationBody): IncomingText | null {
  const raw: unknown = body
  if (!isRecord(raw) || raw.typeWebhook !== 'incomingMessageReceived') return null

  const idMessage = nonEmptyString(raw.idMessage)
  const chatId = isRecord(raw.senderData) ? nonEmptyString(raw.senderData.chatId) : null
  const text = isRecord(raw.messageData) ? readText(raw.messageData) : null
  if (idMessage === null || chatId === null || text === null || text.trim() === '') return null

  const timestamp = timestampToMs(raw.timestamp)

  return { idMessage, chatId, text, timestamp }
}
