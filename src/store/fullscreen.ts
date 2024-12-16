import { useSyncExternalStore } from 'react'

interface FullscreenModeStoreType {
  isFullscreen: boolean
  toggleFullscreenMode: () => void
}

class FullscreenModeStore {
  private isFullscreen: boolean = false
  private listeners: Set<() => void> = new Set()

  constructor() {

  }

  public toggleFullscreenMode() {
    this.isFullscreen = !this.isFullscreen
    localStorage.setItem('isFullscreen', this.isFullscreen.toString())
    this.updateFullscreen()
    this.notify()
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getSnapshot = () => {
    return this.isFullscreen
  }

  private notify = () => {
    this.listeners.forEach((listener) => listener())
  }

  private updateFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }
}

const fullscreenModeStore = new FullscreenModeStore()

export const useFullscreen = (): FullscreenModeStoreType => {
  const isFullscreen = useSyncExternalStore(
    fullscreenModeStore.subscribe,
    fullscreenModeStore.getSnapshot,
  )

  const toggleFullscreenMode = () => {
    fullscreenModeStore.toggleFullscreenMode()
  }

  return { isFullscreen, toggleFullscreenMode }
}
