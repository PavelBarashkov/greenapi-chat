import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { ErrorText } from '../ErrorText'
import styles from './Input.module.css'

type InputProps = Omit<ComponentProps<'input'>, 'id'> & {
  label: string

  hideLabel?: boolean

  hint?: string
  error?: string

  trailing?: ReactNode
}

export function Input({ label, hideLabel, hint, error, trailing, className, ...rest }: InputProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint
  const inputClasses = [styles.input, trailing ? styles.withTrailing : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={hideLabel ? styles.visuallyHidden : styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <input
          id={id}
          className={inputClasses}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        />
        {trailing && <div className={styles.trailing}>{trailing}</div>}
      </div>
      {error ? (
        <ErrorText id={messageId}>{error}</ErrorText>
      ) : (
        hint && (
          <p id={messageId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
