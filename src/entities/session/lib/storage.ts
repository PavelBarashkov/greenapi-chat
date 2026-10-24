import { normalizeApiUrl } from '@/shared/api'
import type { Credentials } from '@/shared/api'

export const CREDENTIALS_STORAGE_KEY = 'greenapi-chat:credentials'

const ONLY_DIGITS = /^\d+$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const credentialsStorage = {
  load(): Credentials | null {
    try {
      const raw = sessionStorage.getItem(CREDENTIALS_STORAGE_KEY)
      if (raw === null) return null

      const data: unknown = JSON.parse(raw)
      if (!isRecord(data)) return null
      const { apiUrl, idInstance, apiTokenInstance } = data
      if (typeof apiUrl !== 'string' || typeof idInstance !== 'string') return null
      if (typeof apiTokenInstance !== 'string' || apiTokenInstance === '') return null
      if (!ONLY_DIGITS.test(idInstance)) return null

      const normalized = normalizeApiUrl(apiUrl)
      if (!normalized.ok) return null
      return { apiUrl: normalized.apiUrl, idInstance, apiTokenInstance }
    } catch {
      return null
    }
  },

  save(credentials: Credentials): boolean {
    try {
      sessionStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials))
      return true
    } catch {
      return false
    }
  },

  clear(): void {
    try {
      sessionStorage.removeItem(CREDENTIALS_STORAGE_KEY)
    } catch {}
  },
}
