import { readScanData, saveScanData } from '@/native'
import { useDark } from '@/store/dark'
import { useScan } from '@/store/product'
import { DataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { LeftOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, notification } from 'antd'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Dashboard from './Dashboard'
import ExtraAction from './ExtraAction'
import ScanForm from './ScanForm'
import ScanTable from './ScanTable'

export const Page: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([])
  const [notificationApi, notificationHolder] = notification.useNotification()
  const { product } = useScan()
  const { isDark, toggleDarkMode } = useDark()

  useEffect(() => {
    readScanData(product?.productValue).then((data) => {
      setDataSource(data)
    })
  }, [])

  useEffect(() => {
    product?.scanDate &&
      readScanData(
        product?.productValue,
        dayjs(product?.scanDate).format('YYYY-MM-DD'),
      ).then((data) => {
        setDataSource(data)
      })
  }, [product.scanDate])

  const onSubmit = (data: DataType) => {
    const index = dataSource.findIndex((t) => t.qrcode === data.qrcode)
    if (index !== -1) {
      notificationApi.info({
        key: 'duplicate',
        message: '友情提示',
        description: '当前扫描的条码重复!',
        placement: 'top',
      })
      return
    }
    if (dayjs().isAfter(dayjs(product.scanDate), 'D')) {
      setDataSource([data])
    } else {
      setDataSource([data, ...dataSource])
    }
    saveScanData(product.productValue, [data, ...dataSource])
  }

  const handleDelete = (qrcode: string) => {
    const data = dataSource.find((item) => item.qrcode === qrcode)
    const date = dayjs(data.date).format('YYYY-MM-DD')
    const finalData = dataSource.filter((item) => item.qrcode !== qrcode)
    setDataSource(finalData)
    saveScanData(product.productValue, finalData, date)
  }

  return (
    <section className="min-h-screen px-8 pt-6">
      <div className="mb-6 w-full">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-primary">
            <LeftOutlined
              style={{
                fontSize: 16,
              }}
            />
            <span className="ml-2">重新选择产品</span>
          </Link>
          <Button
            type="text"
            size="large"
            icon={isDark ? <MoonOutlined /> : <SunOutlined />}
            onClick={toggleDarkMode}
          >
            {isDark ? '暗黑模式' : '浅色模式'}
          </Button>
        </div>
        <h2 className="text-center text-3xl dark:text-white">
          <span>{product?.productName}</span>
          {product?.scanDate ? (
            <span className="ml-2">
              [{dayjs(product?.scanDate).format('YYYY-MM-DD')}]
            </span>
          ) : (
            ''
          )}
        </h2>
      </div>
      <div className="mb-4 w-full">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-auto">
            <ScanForm
              disabled={!dayjs().isSame(product.scanDate, 'D')}
              onSubmit={onSubmit}
            />
          </div>
          <ExtraAction />
        </div>
        <Dashboard data={dataSource} />
      </div>
      <div className="w-full flex-auto">
        <ScanTable data={dataSource} onDelete={handleDelete} />
      </div>
      {notificationHolder}
    </section>
  )
}

export default Page
