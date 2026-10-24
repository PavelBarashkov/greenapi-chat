import { useEffect, useState } from 'react'
import { GreenApiError } from '@/shared/api'
import { chatStore } from '@/entities/chat'
import { useApiClient } from '@/entities/session'

type Options = { onUnauthorized: () => void }

const toDirectChatId = (id: string): string | null => {
  if (/^\d{10,15}$/.test(id)) return `${id}@c.us`
  return /^\d{10,15}@c\.us$/.test(id) ? id : null
}

export function useRestoreChats({ onUnauthorized }: Options): boolean {
  const api = useApiClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    void api
      .getChats({ signal: controller.signal })
      .then((chats) => {
        if (controller.signal.aborted) return
        const ids = chats
          .filter((chat) => !chat.archive && chat.type === 'user')
          .map((chat) => toDirectChatId(chat.id))
          .filter((id): id is string => id !== null)
        chatStore.restore(ids)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof GreenApiError && error.kind === 'unauthorized') onUnauthorized()
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [api, onUnauthorized])

  return loading
}
