export type PhoneError = 'empty' | 'invalidChars' | 'length' | 'leadingZero'

export type ParsePhoneResult =
  { ok: true; chatId: string; digits: string } | { ok: false; reason: PhoneError }

const MIN_DIGITS = 10
const MAX_DIGITS = 15
const SEPARATORS = /[\s().-]/g
const ONLY_DIGITS = /^\d+$/

export function parsePhoneToChatId(input: string): ParsePhoneResult {
  const trimmed = input.trim()
  if (trimmed === '') return { ok: false, reason: 'empty' }

  const withoutSeparators = trimmed.replace(SEPARATORS, '')
  const digits = withoutSeparators.startsWith('+') ? withoutSeparators.slice(1) : withoutSeparators

  if (!ONLY_DIGITS.test(digits)) return { ok: false, reason: 'invalidChars' }
  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS)
    return { ok: false, reason: 'length' }
  if (digits.startsWith('0')) return { ok: false, reason: 'leadingZero' }

  return { ok: true, chatId: `${digits}@c.us`, digits }
}
