import { chatStore, ChatListItem, useActiveChat, useChats } from '@/entities/chat'
import { CreateChatForm } from '@/features/create-chat'
import { LogoutButton } from '@/features/logout'
import styles from './ChatList.module.css'

type ChatListProps = { loading?: boolean }

export function ChatList({ loading = false }: ChatListProps) {
  const chats = useChats()
  const activeChat = useActiveChat()

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <h2 className={styles.title}>Чаты</h2>
      </header>

      <div className={styles.create}>
        <CreateChatForm />
      </div>

      <nav className={styles.list} aria-label="Список чатов">
        {loading && (
          <p className={styles.loading} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            Загружаем чаты…
          </p>
        )}
        {chats.length === 0 && !loading ? (
          <p className={styles.empty}>Чатов пока нет</p>
        ) : chats.length > 0 ? (
          <ul className={styles.items}>
            {chats.map((chat) => (
              <li key={chat.id}>
                <ChatListItem
                  chat={chat}
                  active={chat.id === activeChat?.id}
                  onSelect={chatStore.open}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </nav>

      <footer className={styles.footer}>
        <LogoutButton />
      </footer>
    </aside>
  )
}
