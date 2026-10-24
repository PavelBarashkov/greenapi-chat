import { useIncomingMessages } from '@/features/receive-messages'
import { useChatHistory, useRestoreChats } from '@/features/restore-chats'
import { logout } from '@/features/logout'
import { ChatList } from '@/widgets/chat-list'
import { ChatWindow } from '@/widgets/chat-window'
import styles from './ChatPage.module.css'

const handleUnauthorized = () => logout({ reason: 'unauthorized' })

export function ChatPage() {
  const chatsLoading = useRestoreChats({ onUnauthorized: handleUnauthorized })
  const historyLoading = useChatHistory({ onUnauthorized: handleUnauthorized })
  useIncomingMessages({ onUnauthorized: handleUnauthorized })

  return (
    <div className={styles.page}>
      <ChatList loading={chatsLoading} />
      <ChatWindow onUnauthorized={handleUnauthorized} historyLoading={historyLoading} />
    </div>
  )
}
