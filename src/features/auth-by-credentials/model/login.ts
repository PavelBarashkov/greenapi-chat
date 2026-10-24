import { describeError, GreenApiError, normalizeApiUrl, UNKNOWN_ERROR_TEXT } from '@/shared/api'
import type { Credentials } from '@/shared/api'
import { createSessionApi, sessionStore } from '@/entities/session'
import {
  API_URL_ERRORS,
  ID_INSTANCE_ERROR,
  LOGIN_REQUEST_TIMEOUT_MS,
  NOT_FOUND,
  ONLY_DIGITS,
} from '../lib/constants'
import { describeInstanceState } from '../lib/stateMessage'

export type LoginInput = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type LoginResult =
  | { ok: true }
  | {
      ok: false

      fieldErrors?: { apiUrl?: string; idInstance?: string }

      message?: string
    }

export function validateCredentials(
  input: LoginInput,
):
  | { ok: true; credentials: Credentials }
  | { ok: false; fieldErrors: { apiUrl?: string; idInstance?: string } } {
  const apiUrl = normalizeApiUrl(input.apiUrl)
  const idInstance = input.idInstance.trim()
  const fieldErrors: { apiUrl?: string; idInstance?: string } = {}
  if (!apiUrl.ok) fieldErrors.apiUrl = API_URL_ERRORS[apiUrl.reason]
  if (!ONLY_DIGITS.test(idInstance)) fieldErrors.idInstance = ID_INSTANCE_ERROR

  if (!apiUrl.ok || fieldErrors.idInstance !== undefined) return { ok: false, fieldErrors }
  return {
    ok: true,
    credentials: {
      apiUrl: apiUrl.apiUrl,
      idInstance,
      apiTokenInstance: input.apiTokenInstance.trim(),
    },
  }
}

function describeLoginError(error: unknown): string {
  if (!(error instanceof GreenApiError)) return UNKNOWN_ERROR_TEXT
  if (error.status === NOT_FOUND) return describeError('unauthorized')
  return describeError(error.kind)
}

export async function login(input: LoginInput, signal?: AbortSignal): Promise<LoginResult> {
  const validated = validateCredentials(input)
  if (!validated.ok) return { ok: false, fieldErrors: validated.fieldErrors }

  try {
    const state = await createSessionApi(validated.credentials).getStateInstance({
      signal,
      timeoutMs: LOGIN_REQUEST_TIMEOUT_MS,
    })
    const problem = describeInstanceState(state)
    if (problem !== null) return { ok: false, message: problem }
  } catch (error) {
    return { ok: false, message: describeLoginError(error) }
  }

  sessionStore.authorize(validated.credentials)
  return { ok: true }
}
