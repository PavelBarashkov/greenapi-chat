import { createStore, useStore } from '@/shared/lib/store'
import type { IncomingText } from '../lib/fromNotification'

export type MessageStatus = 'sending' | 'sent' | 'failed'

export type Message = {
  localId: string

  idMessage: string | null
  chatId: string
  direction: 'in' | 'out'
  text: string

  timestamp: number

  status?: MessageStatus

  error?: string
}

type MessageState = {
  byChat: Readonly<Record<string, readonly Message[]>>

  seenIds: ReadonlySet<string>
}

const store = createStore<MessageState>(() => ({ byChat: {}, seenIds: new Set() }))

const NO_MESSAGES: readonly Message[] = []

function appendMessage(message: Message): void {
  store.setState((state) => ({
    ...state,
    byChat: {
      ...state.byChat,
      [message.chatId]: [...(state.byChat[message.chatId] ?? NO_MESSAGES), message],
    },
  }))
}

function updateMessage(localId: string, patch: Partial<Message>, seenId?: string): void {
  store.setState((state) => {
    const chatId = Object.keys(state.byChat).find((id) =>
      state.byChat[id]?.some((message) => message.localId === localId),
    )
    if (chatId === undefined) return state

    const messages = (state.byChat[chatId] ?? NO_MESSAGES).map((message) =>
      message.localId === localId ? { ...message, ...patch } : message,
    )
    return {
      byChat: { ...state.byChat, [chatId]: messages },
      seenIds: seenId === undefined ? state.seenIds : new Set(state.seenIds).add(seenId),
    }
  })
}

export const messageStore = {
  getState: store.getState,
  subscribe: store.subscribe,
  reset: store.reset,

  addOutgoing(chatId: string, text: string): string {
    const localId = crypto.randomUUID()
    appendMessage({
      localId,
      idMessage: null,
      chatId,
      direction: 'out',
      text,
      timestamp: Date.now(),
      status: 'sending',
    })
    return localId
  },

  markSent(localId: string, idMessage: string): void {
    updateMessage(localId, { idMessage, status: 'sent', error: undefined }, idMessage)
  },

  markFailed(localId: string, error: string): void {
    updateMessage(localId, { status: 'failed', error })
  },

  addIncoming({ idMessage, chatId, text, timestamp }: IncomingText): boolean {
    if (store.getState().seenIds.has(idMessage)) return false

    store.setState((state) => ({
      byChat: {
        ...state.byChat,
        [chatId]: [
          ...(state.byChat[chatId] ?? NO_MESSAGES),
          { localId: idMessage, idMessage, chatId, direction: 'in', text, timestamp },
        ],
      },
      seenIds: new Set(state.seenIds).add(idMessage),
    }))
    return true
  },

  addHistory(entries: readonly Message[]): void {
    store.setState((state) => {
      const byChat = { ...state.byChat }
      const seenIds = new Set(state.seenIds)
      let changed = false
      for (const entry of entries) {
        if (seenIds.has(entry.idMessage ?? '') || entry.idMessage === null) continue
        const current = byChat[entry.chatId] ?? NO_MESSAGES
        byChat[entry.chatId] = [...current, entry].sort((a, b) => a.timestamp - b.timestamp)
        seenIds.add(entry.idMessage)
        changed = true
      }
      return changed ? { byChat, seenIds } : state
    })
  },
}

export function useMessages(chatId: string | null): readonly Message[] {
  return useStore(store, (state) =>
    chatId === null ? NO_MESSAGES : (state.byChat[chatId] ?? NO_MESSAGES),
  )
}
