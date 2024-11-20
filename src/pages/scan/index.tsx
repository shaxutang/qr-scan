import { readScanData, saveScanData } from '@/native'
import { useScan } from '@/store/product'
import { DataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { LeftOutlined } from '@ant-design/icons'
import { Card, notification } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Dashboard from './Dashboard'
import ExtraAction from './ExtraAction'
import ScanForm from './ScanForm'
import ScanTable from './ScanTable'
import SearchForm from './SearchForm'

const generateData = (date: string) => {
  const data: { name: string; qrcode: string; date: string }[] = []

  for (let hour = 23; hour >= 0; hour--) {
    const dataCount = Math.floor(Math.random() * (20 - 5 + 1)) + 5

    for (let i = 0; i < dataCount; i++) {
      const formattedDate = dayjs(date)
        .hour(hour)
        .minute(i * (60 / dataCount))
        .second(0)
        .format('YYYY/MM/DD HH:mm:ss')

      data.push({
        name: `Product ${String.fromCharCode(65 + (i % 10))}`,
        qrcode: `${String.fromCharCode(65 + (i % 10))}${hour}${i}`,
        date: formattedDate,
      })
    }
  }

  return data.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
}

export const Page: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([])
  const [input, setInput] = useState('')
  const [notificationApi, notificationHolder] = notification.useNotification()
  const { product } = useScan()

  const filterDataSource = useMemo<DataType[]>(() => {
    return dataSource.filter(
      (data) => data.qrcode.toLowerCase().indexOf(input?.toLowerCase()) !== -1,
    )
  }, [dataSource, input])

  useEffect(() => {
    readScanData(product?.productValue).then((data) => {
      setDataSource(data)
    })
  }, [])

  useEffect(() => {
    typeof product?.scanDate === 'object' &&
      readScanData(
        product?.productValue,
        product?.scanDate.format('YYYY-MM-DD'),
      ).then((data) => {
        setDataSource(data)
      })
  }, [product.scanDate])

  const onSubmit = (data: DataType) => {
    const index = dataSource.findIndex((t) => t.qrcode === data.qrcode)
    if (index !== -1) {
      notificationApi.info({
        message: '友情提示',
        description: '当前扫描的条码重复!',
        placement: 'top',
      })
      return
    }
    if (dayjs(data.date).isAfter(dayjs())) {
      setDataSource([data])
    } else {
      setDataSource([data, ...dataSource])
    }
    setInput('')
    saveScanData(product.productValue, [data, ...dataSource])
  }

  const onSearch = (qrcode: string) => {
    setInput(qrcode)
  }

  return (
    <section className="min-h-screen bg-[#f5f5f5] px-8 pt-6">
      <div className="mb-6 w-full">
        <Link to="/" className="text-primary">
          <LeftOutlined
            style={{
              fontSize: 16,
            }}
          />
          <span className="ml-2">重新选择产品</span>
        </Link>
        <h2 className="text-center text-3xl">{product?.productName}</h2>
      </div>
      <div className="mb-4 w-full">
        <div className="mb-4 flex items-center justify-between">
          <ScanForm
            disabled={!dayjs().isSame(product.scanDate, 'D')}
            onSubmit={onSubmit}
          />
          <ExtraAction />
        </div>
        <Dashboard data={dataSource} />
      </div>
      <div className="w-full flex-auto">
        <Card>
          <div className="mb-4">
            <SearchForm value={input} onSubmit={onSearch} />
          </div>
          <ScanTable data={filterDataSource} />
        </Card>
      </div>
      {notificationHolder}
    </section>
  )
}

export default Page
