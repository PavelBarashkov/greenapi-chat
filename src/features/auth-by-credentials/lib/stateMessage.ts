import type { InstanceState } from '@/shared/api'

export function describeInstanceState(state: InstanceState): string | null {
  switch (state) {
    case 'authorized':
      return null
    case 'notAuthorized':
      return 'Инстанс не авторизован в WhatsApp. Отсканируйте QR-код в консоли GREEN-API'
    case 'starting':
    case 'sleepMode':
      return 'Инстанс запускается или телефон не в сети, попробуйте через пару минут'
    case 'blocked':
    case 'suspended':
    case 'yellowCard':
      return 'Аккаунт WhatsApp заблокирован или ограничен'
  }
}
