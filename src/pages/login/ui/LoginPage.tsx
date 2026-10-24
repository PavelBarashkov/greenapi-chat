import { LoginForm } from '@/features/auth-by-credentials'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" inert>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Чаты</div>
          <div className={styles.sidebarField} />
        </div>
        <div className={styles.feed} />
      </div>
      <div className={styles.overlay}>
        <LoginForm />
      </div>
    </div>
  )
}
