import { describeError, GreenApiError, UNKNOWN_ERROR_TEXT } from '@/shared/api'
import type { GreenApiClient } from '@/shared/api'
import { messageStore } from '@/entities/message'

const TIMEOUT_TEXT = 'Статус неизвестен, проверьте в WhatsApp'

export type SendMessageDeps = {
  api: Pick<GreenApiClient, 'sendMessage'>

  onUnauthorized: () => void
}

export async function sendMessage(
  chatId: string,
  text: string,
  { api, onUnauthorized }: SendMessageDeps,
): Promise<void> {
  const message = text.trim()
  if (message === '') return

  const localId = messageStore.addOutgoing(chatId, message)
  try {
    const { idMessage } = await api.sendMessage({ chatId, message })
    messageStore.markSent(localId, idMessage)
  } catch (error) {
    if (error instanceof GreenApiError) {
      messageStore.markFailed(
        localId,
        error.kind === 'timeout' ? TIMEOUT_TEXT : describeError(error.kind),
      )
      if (error.kind === 'unauthorized') onUnauthorized()
    } else {
      messageStore.markFailed(localId, UNKNOWN_ERROR_TEXT)
    }
  }
}
