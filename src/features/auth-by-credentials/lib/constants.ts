import type { ApiUrlError } from '@/shared/api'

export const LOGIN_REQUEST_TIMEOUT_MS = 10_000

export const ONLY_DIGITS = /^\d+$/
export const NOT_FOUND = 404

export const API_URL_ERRORS: Record<ApiUrlError, string> = {
  empty: 'Введите apiUrl',
  invalidUrl: 'Адрес должен начинаться с https://, например https://1101.api.greenapi.com',
  notHttps: 'Нужен адрес с https://',
  notGreenApiHost: 'Адрес должен быть хостом GREEN-API: *.greenapi.com или *.green-api.com',
}

export const ID_INSTANCE_ERROR = 'idInstance состоит только из цифр'
