import { useSyncExternalStore } from 'react'

class GlobalStore {
  private globalData: Record<string, any> = null
  private listeners: Set<() => void> = new Set()

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getSnapshot = () => {
    return {
      globalData: this.globalData,
    }
  }

  private notify = () => {
    this.listeners.forEach((listener) => listener())
  }
}

const globalStore = new GlobalStore()

export const useGlobal = () => {
  const store = useSyncExternalStore(
    globalStore.subscribe,
    globalStore.getSnapshot,
  )

  return {
    ...store.globalData,
  }
}
