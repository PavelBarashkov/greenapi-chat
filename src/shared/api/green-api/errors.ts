export type GreenApiErrorKind =
  | 'unauthorized'
  | 'rateLimit'
  | 'quota'
  | 'instance'
  | 'badRequest'
  | 'server'
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'invalidResponse'

export class GreenApiError extends Error {
  readonly kind: GreenApiErrorKind
  readonly status: number | undefined

  constructor(kind: GreenApiErrorKind, status?: number, message?: string) {
    super(message ?? `GREEN-API error: ${kind}`)
    this.name = 'GreenApiError'
    this.kind = kind
    this.status = status
  }
}

const RETRYABLE_KINDS: ReadonlySet<GreenApiErrorKind> = new Set([
  'rateLimit',
  'quota',
  'instance',
  'server',
  'network',
  'timeout',
  'invalidResponse',
])

export const isRetryable = (error: GreenApiError): boolean => RETRYABLE_KINDS.has(error.kind)

export const isFatalAuth = (error: GreenApiError): boolean => error.kind === 'unauthorized'

export const UNKNOWN_ERROR_TEXT = 'Неизвестная ошибка'

const ERROR_TEXTS: Record<GreenApiErrorKind, string> = {
  unauthorized:
    'Неверные данные инстанса. Проверьте apiUrl, idInstance и apiTokenInstance в консоли GREEN-API',
  rateLimit: 'Слишком много запросов, подождите',
  quota: 'Достигнут лимит тарифа GREEN-API по числу собеседников. Проверьте тариф в консоли',
  instance: 'Инстанс запускается или не авторизован в WhatsApp. Проверьте его в консоли GREEN-API',
  server: 'Ошибка на стороне GREEN-API, попробуйте позже',
  network: 'Нет связи с GREEN-API. Проверьте сеть и адрес API',
  timeout: 'GREEN-API не ответил вовремя',
  badRequest: UNKNOWN_ERROR_TEXT,
  aborted: UNKNOWN_ERROR_TEXT,
  invalidResponse: UNKNOWN_ERROR_TEXT,
}

export const describeError = (kind: GreenApiErrorKind): string => ERROR_TEXTS[kind]
