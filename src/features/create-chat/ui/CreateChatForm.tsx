import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input } from '@/shared/ui'
import { createChat } from '../model/createChat'
import styles from './CreateChatForm.module.css'

export function CreateChatForm() {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | undefined>()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = createChat(phone)
    if (result.ok) {
      setPhone('')
      setError(undefined)
    } else {
      setError(result.error)
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.input}>
        <Input
          label="Новый чат"
          type="tel"
          placeholder="Номер телефона"
          autoComplete="off"
          value={phone}
          error={error}
          onChange={(event) => {
            setPhone(event.target.value)
            setError(undefined)
          }}
        />
      </div>
      <Button type="submit" variant="icon" className={styles.submit} aria-label="Создать чат">
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </Button>
    </form>
  )
}
