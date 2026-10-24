import { Button } from '@/shared/ui'
import { logout } from '../model/logout'

export function LogoutButton() {
  return (
    <Button variant="outline" onClick={() => logout()}>
      Выйти
    </Button>
  )
}
