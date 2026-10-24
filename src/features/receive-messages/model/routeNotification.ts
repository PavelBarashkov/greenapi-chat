import { toIncomingText } from '@/entities/message'
import type { IncomingText } from '@/entities/message'
import type { NotificationBody } from '@/shared/api'

export type RouteDeps = {
  hasChat: (chatId: string) => boolean
  addIncoming: (message: IncomingText) => void
}

export function routeNotification(
  body: NotificationBody,
  { hasChat, addIncoming }: RouteDeps,
): void {
  const message = toIncomingText(body)
  if (message === null || !hasChat(message.chatId)) return

  addIncoming(message)
}
