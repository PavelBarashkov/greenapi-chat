import { parsePhoneToChatId } from '@/shared/lib/phone'
import { chatStore } from '@/entities/chat'
import { PHONE_ERRORS } from './constants'

export type CreateChatResult = { ok: true } | { ok: false; error: string }

export function createChat(input: string): CreateChatResult {
  const parsed = parsePhoneToChatId(input)
  if (!parsed.ok) return { ok: false, error: PHONE_ERRORS[parsed.reason] }

  chatStore.open(parsed.chatId)
  return { ok: true }
}
