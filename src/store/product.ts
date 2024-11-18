import { useSyncExternalStore } from 'react'
import { Product } from '../types'

export interface ProductStoreType {
  product: Product
  setProduct: (value: Product) => void
}
class ScanStore {
  private product: Product = null!
  private listeners: Set<() => void> = new Set()

  public setProduct(product: Product) {
    this.product = product
    sessionStorage.setItem('product', JSON.stringify(product))
    this.notify()
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getSnapshot = () => {
    if (!this.product) {
      const cacheProduct = sessionStorage.getItem('product')
      this.product = cacheProduct ? JSON.parse(cacheProduct) : null
    }
    return this.product
  }

  private notify = () => {
    this.listeners.forEach((listener) => listener())
  }
}

const scanStore = new ScanStore()

export const useScan = () => {
  const product = useSyncExternalStore(
    scanStore.subscribe,
    scanStore.getSnapshot,
  )

  const setProduct = (value: Product) => {
    scanStore.setProduct(value)
  }

  return { product, setProduct }
}
