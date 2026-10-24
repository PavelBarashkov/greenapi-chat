import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/shared/ui'
import { useApiClient } from '@/entities/session'
import { sendMessage } from '../model/sendMessage'
import styles from './MessageInput.module.css'

type MessageInputProps = {
  chatId: string

  onUnauthorized: () => void
}

export function MessageInput({ chatId, onUnauthorized }: MessageInputProps) {
  const api = useApiClient()
  const [text, setText] = useState('')
  const isEmpty = text.trim() === ''

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isEmpty) return
    void sendMessage(chatId, text, { api, onUnauthorized })
    setText('')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        aria-label="Сообщение"
        placeholder="Сообщение"
        autoComplete="off"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button type="submit" variant="circle" aria-label="Отправить" disabled={isEmpty}>
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h13" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </Button>
    </form>
  )
}
