import type { Credentials, GreenApiClient } from '@/shared/api'
import { createStore, useStore } from '@/shared/lib/store'
import { createSessionApi } from '../api/createSessionApi'
import { credentialsStorage } from '../lib/storage'

export type SessionNotice = 'unauthorized'

export type SessionState =
  | { status: 'anonymous'; notice?: SessionNotice }
  | { status: 'authorized'; credentials: Credentials; api: GreenApiClient }

const store = createStore<SessionState>(() => ({ status: 'anonymous' }))

export const sessionStore = {
  getState: store.getState,
  subscribe: store.subscribe,

  authorize(credentials: Credentials): void {
    credentialsStorage.save(credentials)
    store.setState({ status: 'authorized', credentials, api: createSessionApi(credentials) })
  },

  reset(notice?: SessionNotice): void {
    store.setState(notice === undefined ? { status: 'anonymous' } : { status: 'anonymous', notice })
  },
}

export function useSession(): SessionState {
  return useStore(store, (state) => state)
}
