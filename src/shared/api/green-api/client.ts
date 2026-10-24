import {
  DEFAULT_REQUEST_TIMEOUT_MS,
  RECEIVE_REQUEST_TIMEOUT_MARGIN_MS,
  RECEIVE_TIMEOUT_MAX_SEC,
  RECEIVE_TIMEOUT_SEC,
} from './constants'
import { GreenApiError } from './errors'
import type { GreenApiErrorKind } from './errors'
import type { HttpTransport } from './transport'
import type {
  Credentials,
  InstanceState,
  NotificationBody,
  ReceivedNotification,
  SendMessageRequest,
  SendMessageResponse,
  ApiChat,
  ChatHistoryEntry,
} from './types'

export type CallOptions = {
  signal?: AbortSignal

  timeoutMs?: number
}

export interface GreenApiClient {
  getStateInstance(options?: CallOptions): Promise<InstanceState>
  getChats(options?: CallOptions): Promise<readonly ApiChat[]>
  getChatHistory(
    request: { chatId: string; count?: number },
    options?: CallOptions,
  ): Promise<readonly ChatHistoryEntry[]>
  sendMessage(request: SendMessageRequest, options?: CallOptions): Promise<SendMessageResponse>

  receiveNotification(
    options: CallOptions & { receiveTimeoutSec: number },
  ): Promise<ReceivedNotification | null>

  deleteNotification(receiptId: number, options?: CallOptions): Promise<boolean>
}

export type GreenApiClientConfig = {
  credentials: Credentials
  transport: HttpTransport

  requestTimeoutMs?: number
}

type GreenApiMethod =
  | 'getStateInstance'
  | 'getChats'
  | 'getChatHistory'
  | 'sendMessage'
  | 'receiveNotification'
  | 'deleteNotification'

type JsonObject = Record<string, unknown>

const INSTANCE_PROBLEM = /starting|not authorized|expired|deleted/i

const KNOWN_STATES: Record<InstanceState, true> = {
  authorized: true,
  notAuthorized: true,
  blocked: true,
  sleepMode: true,
  starting: true,
  suspended: true,
  yellowCard: true,
}

export function buildUrl(
  credentials: Credentials,
  method: GreenApiMethod,
  extraPath?: string,
  query?: Record<string, string | number>,
): string {
  const { apiUrl, idInstance, apiTokenInstance } = credentials
  let url = `${apiUrl}/waInstance${encodeURIComponent(idInstance)}/${method}/${encodeURIComponent(apiTokenInstance)}`
  if (extraPath !== undefined) url += `/${encodeURIComponent(extraPath)}`
  if (query !== undefined) {
    const params = new URLSearchParams(
      Object.entries(query).map(([key, value]) => [key, String(value)]),
    )
    url += `?${params.toString()}`
  }
  return url
}

const isRecord = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isInstanceState = (value: unknown): value is InstanceState =>
  typeof value === 'string' && Object.hasOwn(KNOWN_STATES, value)

const clampReceiveTimeoutSec = (value: number): number =>
  Number.isNaN(value)
    ? RECEIVE_TIMEOUT_SEC
    : Math.min(RECEIVE_TIMEOUT_MAX_SEC, Math.max(RECEIVE_TIMEOUT_SEC, Math.trunc(value)))

function statusToKind(status: number, bodyText: string): GreenApiErrorKind {
  if (status === 401 || status === 403) return 'unauthorized'
  if (status === 429) return 'rateLimit'
  if (status === 466) return 'quota'
  if (status === 400) return INSTANCE_PROBLEM.test(bodyText) ? 'instance' : 'badRequest'
  if (status === 499 || status >= 500) return 'server'
  if (status >= 400) return 'badRequest'
  return 'invalidResponse'
}

function assertValidTimeout(ms: number, name: string): void {
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new RangeError(`${name} must be a positive finite number`)
  }
}

export function createGreenApiClient(config: GreenApiClientConfig): GreenApiClient {
  const { credentials, transport, requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS } = config
  assertValidTimeout(requestTimeoutMs, 'requestTimeoutMs')

  const fail = (kind: GreenApiErrorKind, apiMethod: GreenApiMethod, status?: number) =>
    new GreenApiError(
      kind,
      status,
      status === undefined ? `${apiMethod}: ${kind}` : `${apiMethod}: ${kind} (HTTP ${status})`,
    )

  async function call(spec: {
    apiMethod: GreenApiMethod
    httpMethod: 'GET' | 'POST' | 'DELETE'
    extraPath?: string
    query?: Record<string, string | number>
    body?: unknown
    timeoutMs: number
    signal?: AbortSignal
  }): Promise<string> {
    const { apiMethod, httpMethod, extraPath, query, body, timeoutMs, signal } = spec
    assertValidTimeout(timeoutMs, 'timeoutMs')
    if (signal?.aborted) throw fail('aborted', apiMethod)

    const timeoutSignal = AbortSignal.timeout(timeoutMs)
    const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal

    let response
    try {
      response = await transport({
        method: httpMethod,
        url: buildUrl(credentials, apiMethod, extraPath, query),
        body,
        signal: requestSignal,
      })
    } catch {
      if (signal?.aborted) throw fail('aborted', apiMethod)
      if (timeoutSignal.aborted) throw fail('timeout', apiMethod)
      throw fail('network', apiMethod)
    }

    if (response.status < 200 || response.status >= 300) {
      throw fail(statusToKind(response.status, response.bodyText), apiMethod, response.status)
    }
    return response.bodyText
  }

  function parseJson(bodyText: string, apiMethod: GreenApiMethod): unknown {
    try {
      return JSON.parse(bodyText)
    } catch {
      throw fail('invalidResponse', apiMethod)
    }
  }

  return {
    async getChats(options) {
      const apiMethod = 'getChats'
      const bodyText = await call({
        apiMethod,
        httpMethod: 'GET',
        timeoutMs: options?.timeoutMs ?? requestTimeoutMs,
        signal: options?.signal,
      })
      const data = parseJson(bodyText, apiMethod)
      if (!Array.isArray(data)) throw fail('invalidResponse', apiMethod)
      return data.flatMap((entry): ApiChat[] => {
        if (!isRecord(entry) || typeof entry.id !== 'string' || entry.id === '') return []
        return [
          {
            id: entry.id,
            name: typeof entry.name === 'string' ? entry.name : '',
            type: typeof entry.type === 'string' ? entry.type : 'user',
            archive: entry.archive === true,
          },
        ]
      })
    },

    async getChatHistory(request, options) {
      const apiMethod = 'getChatHistory'
      const bodyText = await call({
        apiMethod,
        httpMethod: 'POST',
        body: { chatId: request.chatId, count: request.count ?? 100 },
        timeoutMs: options?.timeoutMs ?? requestTimeoutMs,
        signal: options?.signal,
      })
      const data = parseJson(bodyText, apiMethod)
      if (!Array.isArray(data)) throw fail('invalidResponse', apiMethod)
      return data.flatMap((entry): ChatHistoryEntry[] => {
        if (
          !isRecord(entry) ||
          (entry.type !== 'incoming' && entry.type !== 'outgoing') ||
          typeof entry.idMessage !== 'string' ||
          typeof entry.timestamp !== 'number' ||
          typeof entry.typeMessage !== 'string' ||
          typeof entry.chatId !== 'string'
        )
          return []
        return [
          {
            type: entry.type,
            idMessage: entry.idMessage,
            timestamp: entry.timestamp,
            typeMessage: entry.typeMessage,
            chatId: entry.chatId,
            ...(typeof entry.textMessage === 'string' ? { textMessage: entry.textMessage } : {}),
          },
        ]
      })
    },

    async getStateInstance(options) {
      const apiMethod = 'getStateInstance'
      const bodyText = await call({
        apiMethod,
        httpMethod: 'GET',
        timeoutMs: options?.timeoutMs ?? requestTimeoutMs,
        signal: options?.signal,
      })
      const data = parseJson(bodyText, apiMethod)
      const state = isRecord(data) ? data.stateInstance : undefined
      if (!isInstanceState(state)) throw fail('invalidResponse', apiMethod)
      return state
    },

    async sendMessage(request, options) {
      const apiMethod = 'sendMessage'
      const bodyText = await call({
        apiMethod,
        httpMethod: 'POST',
        body: { chatId: request.chatId, message: request.message },
        timeoutMs: options?.timeoutMs ?? requestTimeoutMs,
        signal: options?.signal,
      })
      const data = parseJson(bodyText, apiMethod)
      const idMessage = isRecord(data) ? data.idMessage : undefined
      if (typeof idMessage !== 'string' || idMessage === '')
        throw fail('invalidResponse', apiMethod)
      return { idMessage }
    },

    async receiveNotification({ receiveTimeoutSec: requestedTimeoutSec, signal }) {
      const apiMethod = 'receiveNotification'
      const receiveTimeoutSec = clampReceiveTimeoutSec(requestedTimeoutSec)
      const bodyText = await call({
        apiMethod,
        httpMethod: 'GET',
        query: { receiveTimeout: receiveTimeoutSec },
        timeoutMs: receiveTimeoutSec * 1000 + RECEIVE_REQUEST_TIMEOUT_MARGIN_MS,
        signal,
      })

      if (bodyText.trim() === '') return null
      const data = parseJson(bodyText, apiMethod)
      if (data === null) return null

      const receiptId = isRecord(data) ? data.receiptId : undefined
      if (!isRecord(data) || typeof receiptId !== 'number' || !Number.isInteger(receiptId)) {
        throw fail('invalidResponse', apiMethod)
      }

      const body = (isRecord(data.body) ? data.body : {}) as NotificationBody
      return { receiptId, body }
    },

    async deleteNotification(receiptId, options) {
      const apiMethod = 'deleteNotification'
      const bodyText = await call({
        apiMethod,
        httpMethod: 'DELETE',
        extraPath: String(receiptId),
        timeoutMs: options?.timeoutMs ?? requestTimeoutMs,
        signal: options?.signal,
      })
      const data = parseJson(bodyText, apiMethod)
      const result = isRecord(data) ? data.result : undefined
      if (typeof result !== 'boolean') throw fail('invalidResponse', apiMethod)
      return result
    },
  }
}
