import { createFetchTransport, createGreenApiClient } from '@/shared/api'
import type { Credentials, GreenApiClient } from '@/shared/api'

export function createSessionApi(credentials: Credentials): GreenApiClient {
  return createGreenApiClient({ credentials, transport: createFetchTransport() })
}
