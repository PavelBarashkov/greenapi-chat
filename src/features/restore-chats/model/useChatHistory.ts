import { useEffect, useState } from 'react'
import { GreenApiError } from '@/shared/api'
import { useActiveChat } from '@/entities/chat'
import { messageStore } from '@/entities/message'
import { useApiClient } from '@/entities/session'

type Options = { onUnauthorized: () => void }

const toMessageText = (entry: { typeMessage: string; textMessage?: string }): string | null => {
  if (entry.typeMessage !== 'textMessage' && entry.typeMessage !== 'extendedTextMessage')
    return null
  return typeof entry.textMessage === 'string' && entry.textMessage.trim() !== ''
    ? entry.textMessage
    : null
}

export function useChatHistory({ onUnauthorized }: Options): boolean {
  const api = useApiClient()
  const chat = useActiveChat()
  const [loadedChatId, setLoadedChatId] = useState<string | null>(null)
  const chatId = chat?.id ?? null

  useEffect(() => {
    if (chatId === null) return
    const controller = new AbortController()
    void api
      .getChatHistory({ chatId, count: 100 }, { signal: controller.signal })
      .then((history) => {
        if (controller.signal.aborted) return
        const messages = history.flatMap((entry) => {
          const text = toMessageText(entry)
          if (text === null) return []
          const validTimestamp = Number.isSafeInteger(entry.timestamp) && entry.timestamp > 0
          return [
            {
              localId: entry.idMessage,
              idMessage: entry.idMessage,
              chatId,
              direction: entry.type === 'incoming' ? ('in' as const) : ('out' as const),
              text,
              timestamp: validTimestamp ? entry.timestamp * 1000 : Date.now(),
              ...(entry.type === 'outgoing' ? { status: 'sent' as const } : {}),
            },
          ]
        })
        messageStore.addHistory(messages)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof GreenApiError && error.kind === 'unauthorized') onUnauthorized()
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedChatId(chatId)
      })
    return () => controller.abort()
  }, [api, chatId, onUnauthorized])

  return chatId !== null && loadedChatId !== chatId
}
