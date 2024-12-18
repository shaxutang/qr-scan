import { readScanData, saveScanData } from '@/native'
import { useDark } from '@/store/dark'
import { useScan } from '@/store/product'
import { DataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { say } from '@/utils/video'
import { LeftOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Modal, notification, Result } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Dashboard from './Dashboard'
import ExtraAction from './ExtraAction'
import ScanForm from './ScanForm'
import ScanTable from './ScanTable'

export const Page: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [notificationApi, notificationHolder] = notification.useNotification()
  const { product, setProduct } = useScan()
  const { isDark, toggleDarkMode } = useDark()
  const tiemr = useRef<NodeJS.Timeout>(null!)

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
    showErrorModal && setShowErrorModal(false)
    const regexp = /\d{7}W\d{10}/gm

    if (!regexp.test(data.qrcode)) {
      say('扫码异常，请检查输入法是否是英文或条码格式错误')
      setShowErrorModal(true)
      clearTimeout(tiemr.current)
      tiemr.current = setTimeout(() => {
        setShowErrorModal(false)
      }, 10000)
      return
    }

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
    let saveData = []
    if (dayjs().isAfter(dayjs(product.scanDate), 'D')) {
      saveData = [data]
      setProduct({
        ...product,
        scanDate: dayjs().toDate().getTime(),
      })
    } else {
      saveData = [data, ...dataSource]
    }
    setDataSource(saveData)
    saveScanData(product.productValue, saveData)
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
            <span className="ml-2">重新选择扫码对象</span>
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
      <Modal
        title="错误提示"
        open={showErrorModal}
        width="80vw"
        styles={{
          body: {
            height: '60vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 36,
          },
        }}
        footer={null}
        maskClosable
        onCancel={() => setShowErrorModal(false)}
      >
        <Result
          status="error"
          title={<h2 className="mb-4 text-4xl">条码格式错误，请重新扫码</h2>}
          subTitle={
            <p className="text-2xl">请检查输入法是否是英文或条码格式错误！</p>
          }
        />
      </Modal>
      {notificationHolder}
    </section>
  )
}

export default Page
