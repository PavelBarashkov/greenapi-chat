import type { Message, MessageStatus } from '../model/messageStore'
import { formatTime } from '../lib/formatTime'
import styles from './MessageBubble.module.css'

const STATUS_LABELS: Record<MessageStatus, string> = {
  sending: 'Отправляется',
  sent: 'Отправлено',
  failed: 'Ошибка',
}

export function MessageBubble({ message }: { message: Message }) {
  const isOut = message.direction === 'out'
  const status = isOut ? message.status : undefined

  return (
    <div className={isOut ? styles.rowOut : styles.rowIn}>
      <div className={isOut ? styles.bubbleOut : styles.bubbleIn}>
        <span className={styles.text}>{message.text}</span>
        {status === 'failed' && message.error && (
          <span className={styles.error} role="alert">
            {message.error}
          </span>
        )}
        <span className={styles.meta}>
          <time dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
          {status && <span className={styles[`status-${status}`]}>{STATUS_LABELS[status]}</span>}
        </span>
      </div>
    </div>
  )
}
