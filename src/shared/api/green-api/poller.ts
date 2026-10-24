import type { GreenApiClient } from './client'
import {
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  BACKOFF_RATE_LIMIT_MIN_MS,
  RECEIVE_TIMEOUT_SEC,
} from './constants'
import { GreenApiError, isFatalAuth } from './errors'
import type { NotificationBody } from './types'

export type NotificationPollerDeps = {
  api: Pick<GreenApiClient, 'receiveNotification' | 'deleteNotification'>

  onNotification: (body: NotificationBody) => void

  onFatalError: (error: GreenApiError) => void

  onHandlerError?: (error: unknown) => void
}

export interface NotificationPoller {
  start(): void

  stop(): void
  readonly running: boolean
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve()
      return
    }
    const finish = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', finish)
      resolve()
    }
    const timer = setTimeout(finish, ms)
    signal.addEventListener('abort', finish)
  })

const DEFAULT_BACKOFF = {
  baseMs: BACKOFF_BASE_MS,
  maxMs: BACKOFF_MAX_MS,
  rateLimitMinMs: BACKOFF_RATE_LIMIT_MIN_MS,
}

export function createNotificationPoller(deps: NotificationPollerDeps): NotificationPoller {
  const { api, onNotification, onFatalError, onHandlerError } = deps

  let controller: AbortController | null = null

  const backoffDelay = (failures: number, error: unknown): number => {
    let delay = Math.min(DEFAULT_BACKOFF.baseMs * 2 ** (failures - 1), DEFAULT_BACKOFF.maxMs)
    if (error instanceof GreenApiError && (error.kind === 'rateLimit' || error.kind === 'quota')) {
      delay = Math.max(delay, DEFAULT_BACKOFF.rateLimitMinMs)
    }
    return delay
  }

  const reportHandlerError = (error: unknown): void => {
    try {
      onHandlerError?.(error)
    } catch {}
  }

  async function run(signal: AbortSignal): Promise<void> {
    let failures = 0
    try {
      while (!signal.aborted) {
        try {
          const notification = await api.receiveNotification({
            receiveTimeoutSec: RECEIVE_TIMEOUT_SEC,
            signal,
          })
          if (notification === null) {
            failures = 0
            continue
          }

          try {
            onNotification(notification.body)
          } catch (error) {
            reportHandlerError(error)
          }

          if (signal.aborted) break

          await api.deleteNotification(notification.receiptId, { signal })
          failures = 0
        } catch (error) {
          if (signal.aborted || (error instanceof GreenApiError && error.kind === 'aborted')) break
          if (error instanceof GreenApiError && isFatalAuth(error)) {
            onFatalError(error)
            break
          }
          failures += 1
          await sleep(backoffDelay(failures, error), signal)
        }
      }
    } finally {
      if (controller?.signal === signal) controller = null
    }
  }

  return {
    start() {
      if (controller !== null) return
      const current = new AbortController()
      controller = current

      run(current.signal).catch(reportHandlerError)
    },

    stop() {
      controller?.abort()
      controller = null
    },

    get running() {
      return controller !== null
    },
  }
}
