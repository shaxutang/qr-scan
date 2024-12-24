import FloatButtons from '@/components/FloatButtons'
import { readScanData, saveScanData } from '@/native'
import { useDark } from '@/store/dark'
import { useProduct } from '@/store/product'
import { useScan } from '@/store/scan'
import { DataType } from '@/types'
import dayjs from '@/utils/dayjs'
import { say } from '@/utils/video'
import { LeftOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Modal, notification, Result } from 'antd'
import { throttle } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Dashboard from './Dashboard'
import ExtraAction from './ExtraAction'
import ScanForm from './ScanForm'
import ScanTable from './ScanTable'

type Page = {
  current: number
  total: number
}

const throttleSay = throttle(say, 1000)

function generateData(count: number): DataType[] {
  const data: DataType[] = []

  for (let i = 0; i < count; i++) {
    const prefix = String(Math.floor(1000000 + Math.random() * 9000000)) // 7位数字
    const suffix = String(Math.floor(1000000000 + Math.random() * 9000000000)) // 10位数字
    const qrcode = `${prefix}W${suffix}`

    data.push({
      productName: `Product ${i + 1}`,
      productValue: `qì_yā_fá`,
      qrcode,
      date: Date.now(),
    })
  }

  return data
}

const Page: React.FC = () => {
  const scan = useScan()
  const { product, setProduct } = useProduct()
  const { isDark, toggleDarkMode } = useDark()
  const [notificationApi, notificationHolder] = notification.useNotification()

  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorQrCode, setErrorQrCode] = useState('')

  const timer = useRef<NodeJS.Timeout | null>(null)

  // useEffect(() => {
  //   const index = setInterval(() => {
  //     generateData(1).forEach(onSubmit)
  //   }, 1000)
  //   return () => {
  //     clearInterval(index)
  //   }
  // }, [])

  useEffect(() => {
    if (product?.productValue && product?.scanDate) {
      readScanData(
        product.productValue,
        dayjs(product.scanDate).format('YYYY-MM-DD'),
      ).then((data) => {
        scan.setDataByFull(data)
      })
    }
  }, [product?.scanDate, product?.productValue])

  const onSubmit = async (data: DataType) => {
    if (product.scanRule) {
      const regexp = new RegExp(product.scanRule)

      showErrorModal && setShowErrorModal(false)

      if (!regexp.test(data.qrcode)) {
        throttleSay(
          '扫码异常，请确认输入法是否是英文或当前扫描条码格式是否有误',
        )
        setErrorQrCode(data.qrcode)
        setShowErrorModal(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          setShowErrorModal(false)
        }, 10000)
        return
      }
    }

    if (scan.isExists(data.qrcode)) {
      notificationApi.info({
        key: 'duplicate',
        message: '友情提示',
        description: '当前扫描的条码重复!',
        placement: 'top',
      })
      return
    }

    if (dayjs().isAfter(dayjs(product.scanDate), 'D')) {
      scan.reset()
      setProduct({
        ...product,
        scanDate: dayjs().toDate().getTime(),
      })
    }
    scan.submit(data)
    saveScanData(
      product.productValue,
      scan.getDatas(),
      dayjs(product.scanDate).format('YYYY-MM-DD'),
    )
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
        <Dashboard />
      </div>
      <div className="w-full flex-auto">
        <ScanTable />
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
            <p className="text-2xl">
              请确认输入法是否是英文或当前扫描条码格式是否有误！
            </p>
          }
        >
          <div className="text-center">
            错误条码：
            <span className="text-red-500 underline">{errorQrCode}</span>
          </div>
        </Result>
      </Modal>
      {notificationHolder}
      <FloatButtons />
    </section>
  )
}

export default Page
