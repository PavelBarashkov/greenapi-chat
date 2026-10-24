import type { PhoneError } from '@/shared/lib/phone'

export const PHONE_ERRORS: Record<PhoneError, string> = {
  empty: 'Введите номер телефона',
  invalidChars: 'Допустимы цифры, пробелы, скобки, дефисы и «+» в начале',
  length: 'В номере должно быть от 10 до 15 цифр',
  leadingZero: 'Номер начинается с кода страны, а не с нуля',
}
