export type Store<T> = {
  getState: () => T

  setState: (next: T | ((prev: T) => T)) => void
  subscribe: (listener: () => void) => () => void

  reset: () => void
}

export function createStore<T>(createInitialState: () => T): Store<T> {
  let state = createInitialState()
  const listeners = new Set<() => void>()

  const replace = (next: T) => {
    if (Object.is(next, state)) return
    state = next

    for (const listener of [...listeners]) listener()
  }

  return {
    getState: () => state,
    setState: (next) => {
      replace(typeof next === 'function' ? (next as (prev: T) => T)(state) : next)
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    reset: () => {
      replace(createInitialState())
    },
  }
}
