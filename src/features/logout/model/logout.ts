import { chatStore } from '@/entities/chat'
import { messageStore } from '@/entities/message'
import { credentialsStorage, sessionStore } from '@/entities/session'

type LogoutOptions = {
  reason?: 'unauthorized'
}

export function logout({ reason }: LogoutOptions = {}): void {
  credentialsStorage.clear()
  chatStore.reset()
  messageStore.reset()
  sessionStore.reset(reason)
}
