import { createSessionApi, credentialsStorage, sessionStore } from '@/entities/session'
import { LOGIN_REQUEST_TIMEOUT_MS } from '../lib/constants'

export async function restoreSession(signal: AbortSignal): Promise<void> {
  const credentials = credentialsStorage.load()
  if (credentials === null) return

  try {
    const state = await createSessionApi(credentials).getStateInstance({
      signal,
      timeoutMs: LOGIN_REQUEST_TIMEOUT_MS,
    })
    if (signal.aborted) return
    if (state === 'authorized') {
      sessionStore.authorize(credentials)
      return
    }
  } catch {
    if (signal.aborted) return
  }
  credentialsStorage.clear()
}
