import { useEffect, useRef } from 'react'
import { formatPhone, useActiveChat } from '@/entities/chat'
import { MessageBubble, useMessages } from '@/entities/message'
import { MessageInput } from '@/features/send-message'
import styles from './ChatWindow.module.css'

type ChatWindowProps = {
  onUnauthorized: () => void
  historyLoading?: boolean
}

export function ChatWindow({ onUnauthorized, historyLoading = false }: ChatWindowProps) {
  const chat = useActiveChat()
  const messages = useMessages(chat?.id ?? null)
  const feedRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const feed = feedRef.current
    if (feed) feed.scrollTop = feed.scrollHeight
  }, [chat?.id, messages.length])

  if (chat === null) {
    return (
      <main className={styles.window}>
        <p className={styles.empty}>Создайте чат по номеру телефона</p>
      </main>
    )
  }

  return (
    <main className={styles.window}>
      <header className={styles.header}>
        <h1 className={styles.title}>{formatPhone(chat.phone)}</h1>
      </header>
      <section ref={feedRef} className={styles.feed} aria-label="Сообщения">
        {historyLoading && (
          <p
            className={`${styles.historyLoading} ${messages.length === 0 ? styles.historyLoadingCentered : ''}`}
            role="status"
          >
            <span className={styles.spinner} aria-hidden="true" />
            Загружаем историю…
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.localId} message={message} />
        ))}
      </section>
      <MessageInput key={chat.id} chatId={chat.id} onUnauthorized={onUnauthorized} />
    </main>
  )
}
