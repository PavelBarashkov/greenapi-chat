import type { ComponentProps } from 'react'
import styles from './ErrorText.module.css'

export function ErrorText({ className, ...rest }: ComponentProps<'p'>) {
  const classes = [styles.error, className].filter(Boolean).join(' ')
  return <p role="alert" className={classes} {...rest} />
}
