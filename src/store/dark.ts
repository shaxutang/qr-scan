import { useSyncExternalStore } from 'react'

interface DarkModeStoreType {
  isDark: boolean
  toggleDarkMode: () => void
}

class DarkModeStore {
  private isDark: boolean = false
  private listeners: Set<() => void> = new Set()

  constructor() {
    const storedIsDark = localStorage.getItem('isDark')
    if (storedIsDark !== null) {
      this.isDark = storedIsDark === 'true'
    }
    this.updateHtmlClass()
  }

  public toggleDarkMode() {
    this.isDark = !this.isDark
    localStorage.setItem('isDark', this.isDark.toString())
    this.updateHtmlClass()
    this.notify()
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getSnapshot = () => {
    return this.isDark
  }

  private notify = () => {
    this.listeners.forEach((listener) => listener())
  }

  private updateHtmlClass() {
    const htmlElement = document.documentElement
    if (this.isDark) {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }
}

const darkModeStore = new DarkModeStore()

export const useDark = (): DarkModeStoreType => {
  const isDark = useSyncExternalStore(
    darkModeStore.subscribe,
    darkModeStore.getSnapshot,
  )

  const toggleDarkMode = () => {
    darkModeStore.toggleDarkMode()
  }

  return { isDark, toggleDarkMode }
}
