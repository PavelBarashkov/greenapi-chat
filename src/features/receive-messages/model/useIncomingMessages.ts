import { useEffect, useRef } from 'react'
import { createNotificationPoller } from '@/shared/api'
import { chatStore } from '@/entities/chat'
import { messageStore } from '@/entities/message'
import { useApiClient } from '@/entities/session'
import { routeNotification } from './routeNotification'

type Options = {
  onUnauthorized: () => void
}

const hasChat = (chatId: string): boolean => chatStore.getState().byId[chatId] !== undefined

export function useIncomingMessages({ onUnauthorized }: Options): void {
  const api = useApiClient()
  const onUnauthorizedRef = useRef(onUnauthorized)

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized
  }, [onUnauthorized])

  useEffect(() => {
    const poller = createNotificationPoller({
      api,
      onNotification: (body) =>
        routeNotification(body, { hasChat, addIncoming: messageStore.addIncoming }),
      onFatalError: () => onUnauthorizedRef.current(),
    })
    poller.start()
    return () => poller.stop()
  }, [api])
}
