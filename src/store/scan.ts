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
const buildHourCapacityMap = (
  data: DataType[],
  hourCapacityMap: Map<number, number>,
) => {
  // 初始化一个空对象用于存储分组后的数据
  hourCapacityMap.clear()

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
}

export class ScanStore {
  private datas: DataType[] = []
  private hourCapacityMap: Map<number, number> = new Map()
  private listeners: Set<() => void> = new Set()
  private snapshot: Snapshot = {
    speed: 0,
    lastHourCapacity: 0,
    totalCapacity: 0,
    growth: 0,
    charData: [],
  }
  private cache = new Map()

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify = () => {
    this.buildSnapshot()
    this.cacheSortDats()
    this.listeners.forEach((listener) => listener())
  }

  private setDataByFull = (savedData: DataType[] = []) => {
    this.datas = savedData
    buildHourCapacityMap(savedData, this.hourCapacityMap)
    this.notify()
  }

  private submit = (data: DataType) => {
    this.datas.push(data)
    const hour = dayjs(data.date).hour()
    this.hourCapacityMap.set(hour, (this.hourCapacityMap.get(hour) ?? 0) + 1)
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
    return this.datas.length
  }

  private speed = () => {
    return this.hourCapacityMap.size > 0
      ? this.datas.length / this.hourCapacityMap.size
      : 0
  }

  private getGrowth = () => {
    const hours = Array.from(this.hourCapacityMap.keys()).sort(
      (k1, k2) => k2 - k1,
    )
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
      .sort((k1, k2) => k1 - k2)
      .map((key) => {
        return {
          time: dayjs().hour(key).format('HH:00'),
          capacity: this.hourCapacityMap.get(key),
        }
      })
  }

  private getByPage = (page: number, qrcode?: string) => {
    return ((this.cache.get('sortDatas') ?? []) as DataType[])
      .filter((data) =>
        qrcode ? data.qrcode.lastIndexOf(qrcode) !== -1 : true,
      )
      .slice((page - 1) * MAX_CAPACITY, page * MAX_CAPACITY)
  }

  public getSnapshot = () => {
    return this.snapshot
  }

  private isExists = (qrcode: string) => {
    return this.datas.some((item) => item.qrcode === qrcode)
  }

  private cacheSortDats = () => {
    this.cache.set(
      'sortDatas',
      this.datas.sort(
        (d1, d2) => dayjs(d2.date).valueOf() - dayjs(d1.date).valueOf(),
      ),
    )
  }

  private getDatas = () => {
    return this.cache.get('sortDatas')
  }

  public callbacks = () => {
    return {
      reset: this.reset,
      submit: this.submit,
      setDataByFull: this.setDataByFull,
      getByPage: this.getByPage,
      isExists: this.isExists,
      getDatas: this.getDatas,
    }
  }

  private reset = () => {
    this.datas = []
    this.hourCapacityMap.clear()
    this.cache.clear()
    this.notify()
  }
}

const scanStore = new ScanStore()

export const useScan = () => {
  const store = useSyncExternalStore(scanStore.subscribe, scanStore.getSnapshot)

  return { ...store, ...scanStore.callbacks() }
}
