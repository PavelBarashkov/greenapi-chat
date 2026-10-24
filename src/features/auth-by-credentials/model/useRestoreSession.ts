import { useEffect, useState } from 'react'
import { credentialsStorage } from '@/entities/session'
import { restoreSession } from './restoreSession'

export function useRestoreSession(): boolean {
  const [restoring, setRestoring] = useState(() => credentialsStorage.load() !== null)

  useEffect(() => {
    const controller = new AbortController()
    void restoreSession(controller.signal).then(() => {
      if (!controller.signal.aborted) setRestoring(false)
    })
    return () => controller.abort()
  }, [])

  return restoring
}
