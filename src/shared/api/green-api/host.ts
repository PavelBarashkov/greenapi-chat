export type ApiUrlError = 'empty' | 'invalidUrl' | 'notHttps' | 'notGreenApiHost'

export type NormalizeApiUrlResult =
  { ok: true; apiUrl: string } | { ok: false; reason: ApiUrlError }

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i

const GREEN_API_HOST = /^([a-z0-9-]+\.)*(greenapi|green-api)\.com$/

export function normalizeApiUrl(input: string): NormalizeApiUrlResult {
  const trimmed = input.trim()
  if (trimmed === '') return { ok: false, reason: 'empty' }
  if (!HAS_SCHEME.test(trimmed)) return { ok: false, reason: 'invalidUrl' }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return { ok: false, reason: 'invalidUrl' }
  }

  if (url.protocol !== 'https:') return { ok: false, reason: 'notHttps' }
  if (!GREEN_API_HOST.test(url.hostname)) return { ok: false, reason: 'notGreenApiHost' }

  return { ok: true, apiUrl: url.origin }
}
