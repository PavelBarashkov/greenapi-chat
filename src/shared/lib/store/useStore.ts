import { useSyncExternalStore } from 'react'
import type { Store } from './createStore'

export function useStore<T, S>(
  store: Pick<Store<T>, 'getState' | 'subscribe'>,
  selector: (state: T) => S,
): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()))
}
