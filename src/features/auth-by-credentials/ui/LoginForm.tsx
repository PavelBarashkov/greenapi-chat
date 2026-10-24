import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useSession } from '@/entities/session'
import { Button, ErrorText, Input } from '@/shared/ui'
import { login } from '../model/login'
import type { LoginInput } from '../model/login'
import { EyeIcon } from './EyeIcon'
import { SESSION_EXPIRED_TEXT } from './constants'
import styles from './LoginForm.module.css'

type FieldErrors = { apiUrl?: string; idInstance?: string }

export function LoginForm() {
  const session = useSession()
  const [values, setValues] = useState<LoginInput>({
    apiUrl: '',
    idInstance: '',
    apiTokenInstance: '',
  })
  const [showToken, setShowToken] = useState(false)
  const [pending, setPending] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const requestRef = useRef<AbortController | null>(null)

  useEffect(() => () => requestRef.current?.abort(), [])

  const filled = Object.values(values).every((value) => value.trim() !== '')
  const notice = session.status === 'anonymous' && session.notice === 'unauthorized'

  const setValue = (field: keyof LoginInput) => (event: { target: { value: string } }) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!filled || pending) return

    const controller = new AbortController()
    requestRef.current = controller
    setPending(true)
    setFieldErrors({})
    setMessage(null)

    const result = await login(values, controller.signal)
    if (controller.signal.aborted) return

    setPending(false)
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {})
      setMessage(result.message ?? null)
    }
  }

  return (
    <form
      className={styles.form}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
    >
      <h1 id="login-title" className={styles.title}>
        Вход в чат
      </h1>

      <div className={styles.fields}>
        <Input
          label="API URL"
          type="url"
          placeholder="https://1101.api.greenapi.com"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          value={values.apiUrl}
          error={fieldErrors.apiUrl}
          onChange={setValue('apiUrl')}
        />
        <Input
          label="idInstance"
          inputMode="numeric"
          placeholder="1101000000"
          autoComplete="off"
          value={values.idInstance}
          error={fieldErrors.idInstance}
          onChange={setValue('idInstance')}
        />
        <Input
          label="apiTokenInstance"
          type={showToken ? 'text' : 'password'}
          placeholder="Токен инстанса"
          autoComplete="off"
          spellCheck={false}
          value={values.apiTokenInstance}
          onChange={setValue('apiTokenInstance')}
          trailing={
            <Button
              variant="ghost"
              aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
              aria-pressed={showToken}
              onClick={() => setShowToken((prev) => !prev)}
            >
              <EyeIcon crossed={showToken} />
            </Button>
          }
        />
      </div>

      <div className={styles.footer}>
        {message ? (
          <ErrorText>{message}</ErrorText>
        ) : (
          notice && <ErrorText>{SESSION_EXPIRED_TEXT}</ErrorText>
        )}
        <Button type="submit" disabled={!filled || pending}>
          {pending ? 'Проверяем…' : 'Войти'}
        </Button>
      </div>
    </form>
  )
}
