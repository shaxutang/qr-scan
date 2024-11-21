import { useSyncExternalStore } from 'react'
import { Product } from '../types'

export interface StoreProduct extends Product {
  scanDate: number
}

export interface ProductStoreType {
  product: StoreProduct
  setProduct: (value: StoreProduct) => void
}
class ScanStore {
  private product: StoreProduct = null!
  private listeners: Set<() => void> = new Set()

  public setProduct(product: StoreProduct) {
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

  const setProduct = (value: StoreProduct) => {
    scanStore.setProduct(value)
  }

  return { product, setProduct }
}
