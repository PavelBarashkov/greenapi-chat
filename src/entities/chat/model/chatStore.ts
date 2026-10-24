import { useMemo } from 'react'
import { createStore, useStore } from '@/shared/lib/store'

export type Chat = {
  id: string

  phone: string
  createdAt: number
}

type ChatState = {
  order: readonly string[]
  byId: Readonly<Record<string, Chat>>
  activeId: string | null
}

const WHATSAPP_USER_SUFFIX = /@c\.us$/

const store = createStore<ChatState>(() => ({ order: [], byId: {}, activeId: null }))

export const chatStore = {
  getState: store.getState,
  subscribe: store.subscribe,
  reset: store.reset,

  open(chatId: string): void {
    store.setState((state) => {
      if (state.byId[chatId] === undefined) {
        const chat: Chat = {
          id: chatId,
          phone: chatId.replace(WHATSAPP_USER_SUFFIX, ''),
          createdAt: Date.now(),
        }
        return {
          order: [...state.order, chatId],
          byId: { ...state.byId, [chatId]: chat },
          activeId: chatId,
        }
      }
      return state.activeId === chatId ? state : { ...state, activeId: chatId }
    })
  },

  restore(chatIds: readonly string[]): void {
    store.setState((state) => {
      const order = [...state.order]
      const byId = { ...state.byId }
      for (const chatId of chatIds) {
        if (byId[chatId] !== undefined) continue
        byId[chatId] = {
          id: chatId,
          phone: chatId.replace(WHATSAPP_USER_SUFFIX, ''),
          createdAt: Date.now(),
        }
        order.push(chatId)
      }
      const activeId = state.activeId ?? order[0] ?? null
      if (order.length === state.order.length && activeId === state.activeId) return state
      return { order, byId, activeId }
    })
  },
}

export function useChats(): readonly Chat[] {
  const order = useStore(store, (state) => state.order)
  const byId = useStore(store, (state) => state.byId)
  return useMemo(() => order.flatMap((id) => byId[id] ?? []), [order, byId])
}

export function useActiveChat(): Chat | null {
  return useStore(store, (state) =>
    state.activeId === null ? null : (state.byId[state.activeId] ?? null),
  )
}
