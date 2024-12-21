import { DataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { Dayjs } from 'dayjs'
import { useSyncExternalStore } from 'react'

const MAX_CAPACITY: number = 10

export class ScanStore {
  private currentIndex: number = 0
  private data: DataType[][] = []
  private hourCapacityMap: Map<number, number> = new Map()
  private totalCapacity: number = 0
  private listeners: Set<() => void> = new Set()

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify = () => {
    this.listeners.forEach((listener) => listener())
  }

  public setDataByFull = (data: DataType[] = []) => {
    const count = Math.floor(data.length / MAX_CAPACITY)
    const restCount = data.length % MAX_CAPACITY
    for (let i = 0; i < count; i++) {
      this.data[i] = data.slice(
        i * MAX_CAPACITY,
        restCount && count - 1 === i ? restCount - 1 : (i + 1) * MAX_CAPACITY,
      )
    }
    this.notify()
  }

  public submit = (data: DataType, scanDate: Dayjs) => {
    if (dayjs().isAfter(dayjs(scanDate), 'D')) {
      this.reset()
    }
    const tempCurrentData: DataType[] = this.data[this.currentIndex]
    tempCurrentData.unshift(data)
    if (tempCurrentData.length === MAX_CAPACITY) {
      this.currentIndex++
    }

    const hour = dayjs(data.date).hour()
    this.hourCapacityMap.set(hour, (this.hourCapacityMap.get(hour) ?? 0) + 1)

    this.totalCapacity++

    this.notify()
  }

  public getCurrentHourCapacity = (hour: number) => {
    return this.hourCapacityMap.get(hour) ?? 0
  }

  public speed = () => {
    return this.totalCapacity / this.hourCapacityMap.size
  }

  public getByPage = (page: number) => {
    if (page >= this.data.length) {
      return []
    }
    return this.data[this.data.length - page]
  }

  public reset = () => {
    this.currentIndex = 0
    this.data = []
    this.hourCapacityMap.clear()
    this.totalCapacity = 0
    this.notify()
  }
}

const scanStore = new ScanStore()

export const useScan = () => {
  const store = useSyncExternalStore(scanStore.subscribe, () => scanStore)
  return {
    store,
  }
}
