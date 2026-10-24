import { useSession } from './sessionStore'
import type { GreenApiClient } from '@/shared/api'

export function useApiClient(): GreenApiClient {
  const session = useSession()
  if (session.status !== 'authorized') {
    throw new Error('useApiClient was used without an authorized session')
  }
  return session.api
}
