import { formatPhone } from '../lib/formatPhone'
import type { Chat } from '../model/chatStore'
import { ChatAvatar } from './ChatAvatar'
import styles from './ChatListItem.module.css'

type ChatListItemProps = {
  chat: Chat
  active: boolean
  onSelect: (chatId: string) => void
}

export function ChatListItem({ chat, active, onSelect }: ChatListItemProps) {
  return (
    <button
      type="button"
      className={active ? `${styles.item} ${styles.active}` : styles.item}
      aria-current={active ? 'true' : undefined}
      onClick={() => onSelect(chat.id)}
    >
      <ChatAvatar />
      <span className={styles.phone}>{formatPhone(chat.phone)}</span>
    </button>
  )
}
