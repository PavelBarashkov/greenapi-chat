import { useRestoreSession } from '@/features/auth-by-credentials'
import { useSession } from '@/entities/session'
import { ChatPage } from '@/pages/chat'
import { LoginPage } from '@/pages/login'
import styles from './App.module.css'
import './styles/index.css'

export function App() {
  const session = useSession()
  const restoring = useRestoreSession()

  if (restoring) {
    return (
      <p className={styles.status} role="status">
        Проверяем сохранённую сессию…
      </p>
    )
  }
  return session.status === 'authorized' ? <ChatPage /> : <LoginPage />
}
