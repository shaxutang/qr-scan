import { DataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { useSyncExternalStore } from 'react'

type Snapshot = {
  speed: number
  lastHourCapacity: number
  totalCapacity: number
  growth: number
  charData: {
    time: string
    capacity: number
  }[]
}

const MAX_CAPACITY: number = 10

/**
 * 根据数据中的日期字段，将数据数组按小时分组
 * @param data 数据数组，包含带有日期字段的多个数据对象
 * @returns 返回一个对象，其中每个键代表一个小时，值是属于该小时的数据数组
 */
const buildHourCapacityMap = (data: DataType[]): Map<number, number> => {
  // 初始化一个空对象用于存储分组后的数据
  const hourCapacityMap: Map<number, number> = new Map()

  // 遍历数据数组中的每个项目
  data.forEach((item) => {
    // 使用dayjs库将日期格式化为'YYYY/MM/DD HH:00:00'，以实现按小时分组
    const hour = dayjs(item.date).hour()

    // 检查当前小时是否已初始化，如果未初始化则创建一个空数组
    if (!hourCapacityMap.get(hour)) {
      hourCapacityMap.set(hour, 0)
    }

    // 将当前数据项添加到对应的小时分组中
    hourCapacityMap.set(hour, (hourCapacityMap.get(hour) ?? 0) + 1)
  })

  // 返回按小时分组的数据对象
  return hourCapacityMap
}

export class ScanStore {
  private datas: DataType[][] = []
  private hourCapacityMap: Map<number, number> = new Map()
  private totalCapacity: number = 0
  private listeners: Set<() => void> = new Set()
  private snapshot: Snapshot = {
    speed: 0,
    lastHourCapacity: 0,
    totalCapacity: 0,
    growth: 0,
    charData: [],
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify = () => {
    this.buildSnapshot()
    this.listeners.forEach((listener) => listener())
  }

  private splitDataIntoChunks = (data: DataType[]) => {
    const count = Math.ceil(data.length / MAX_CAPACITY)
    this.datas = []

    for (let i = 0; i < count; i++) {
      const start = i * MAX_CAPACITY
      const end = Math.min(start + MAX_CAPACITY, data.length)
      this.datas.push(data.slice(start, end))
    }
  }

  private setDataByFull = (savedData: DataType[] = []) => {
    if (savedData.length < MAX_CAPACITY) {
      this.datas = [savedData]
    } else {
      this.splitDataIntoChunks(savedData)
    }
    this.hourCapacityMap = buildHourCapacityMap(savedData)
    this.totalCapacity = savedData.length
    this.buildSnapshot()
    this.notify()
  }

  private submit = (data: DataType) => {
    this.datas[0].unshift(data)
    if (this.datas[0].length === MAX_CAPACITY) {
      this.datas.unshift(this.datas[0])
      this.datas[0] = []
    }

    const hour = dayjs(data.date).hour()
    this.hourCapacityMap.set(hour, (this.hourCapacityMap.get(hour) ?? 0) + 1)

    this.totalCapacity++
    this.notify()
  }

  private deleteByQrcode = (qrcode: string) => {
    const flatDatas = this.getFlatDatas().filter(
      (item) => item.qrcode !== qrcode,
    )
    console.log(flatDatas)
    this.hourCapacityMap = buildHourCapacityMap(flatDatas)
    this.totalCapacity = flatDatas.length
    this.splitDataIntoChunks(flatDatas)
    this.notify()
  }

  public buildSnapshot = () => {
    const speed = this.speed()
    const lastHourCapacity = this.getLastHourCapacity()
    const totalCapacity = this.getTotalCapacity()
    const growth = this.getGrowth()
    const charData = this.getCharData()

    this.snapshot = {
      speed,
      lastHourCapacity,
      totalCapacity,
      growth,
      charData,
    }
  }

  private getLastHourCapacity = () => {
    if (!this.hourCapacityMap.size) {
      return 0
    }
    const max = Math.max(...Array.from(this.hourCapacityMap.keys()))
    return this.hourCapacityMap.get(max)
  }

  private getHourCapacity = (hour: number) => {
    return this.hourCapacityMap.get(hour) ?? 0
  }

  private getTotalCapacity = () => {
    return this.totalCapacity
  }

  private speed = () => {
    return this.hourCapacityMap.size > 0
      ? this.totalCapacity / this.hourCapacityMap.size
      : 0
  }

  private getGrowth = () => {
    const hours = Array.from(this.hourCapacityMap.keys()).sort().reverse()
    const currentHour = hours[0]
    const previousHour = hours[1]

    if (!previousHour) {
      return 0
    }

    return (
      (this.getHourCapacity(currentHour) - this.getHourCapacity(previousHour)) /
      this.getHourCapacity(previousHour)
    )
  }

  private getCharData = () => {
    const keys = this.hourCapacityMap.keys()
    return Array.from(keys)
      .sort()
      .map((key) => {
        return {
          time: dayjs().hour(key).format('HH:00'),
          capacity: this.hourCapacityMap.get(key),
        }
      })
  }

  private getByPage = (page: number) => {
    if (page > this.datas.length) {
      return []
    }
    return this.datas[page - 1]
  }

  public getSnapshot = () => {
    return this.snapshot
  }

  private isExists = (qrcode: string) => {
    return this.datas.some((item) =>
      item.some((data) => data.qrcode === qrcode),
    )
  }

  private getFlatDatas = () => {
    return this.datas.flat()
  }

  public callbacks = () => {
    return {
      reset: this.reset,
      submit: this.submit,
      setDataByFull: this.setDataByFull,
      getByPage: this.getByPage,
      isExists: this.isExists,
      deleteByQrcode: this.deleteByQrcode,
      getFlatDatas: this.getFlatDatas,
    }
  }

  private reset = () => {
    this.datas = []
    this.hourCapacityMap.clear()
    this.totalCapacity = 0
    this.notify()
  }
}

const scanStore = new ScanStore()

export const useScan = () => {
  const store = useSyncExternalStore(scanStore.subscribe, scanStore.getSnapshot)

  return { ...store, ...scanStore.callbacks() }
}
