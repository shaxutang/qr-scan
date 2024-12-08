import {
  exportScanDataExcel,
  getExoportList,
  openExportExplorer,
  readScanData,
} from '@/native'
import dayjs from '@/utils/dayjs'
import { HistoryOutlined } from '@ant-design/icons/lib'
import { Button, Drawer, Empty, List, message, Space } from 'antd'
import { Dayjs } from 'dayjs'
import { useState } from 'react'
import { useScan } from '../../store/product'

const HistoryDawerButton: React.FC = () => {
  const [exportList, setExportList] = useState<
    {
      name: string
      date: Dayjs
      path: string
      allowExport: boolean
    }[]
  >([])
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [messageApi, holder] = message.useMessage()
  const { product, setProduct } = useScan()

  const onClick = async () => {
    setOpen(true)
    setLoading(true)
    const list = await getExoportList(product.productValue)
    let finalList = list
      .map((item) => {
        const dateStr = item.path.replace(/^.*[\\/]/, '')
        return {
          ...item,
          allowExport: true,
          date: dayjs(dateStr),
        }
      })
      .filter((item) => item.date.isValid())

    const hasNow = finalList.some((item) => item.date.isSame(dayjs(), 'D'))

    if (!hasNow) {
      finalList.push({
        name: dayjs().format('YYYY-MM-DD'),
        date: dayjs(),
        path: '',
        allowExport: false,
      })
    }
    setExportList(finalList)
    setLoading(false)
  }

  const onExport = async (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const data = await readScanData(product.productValue, dateStr)
    if (!data.length) {
      messageApi.info('至少要有一条数据')
      return
    }
    const { success, message } = await exportScanDataExcel(
      product.productName,
      dateStr,
      data,
    )
    if (success) {
      messageApi.success(message)
      openExportExplorer(product.productName, dateStr)
    } else {
      messageApi.error(message)
    }
  }
  const onView = (scanDate: Dayjs) => {
    setProduct({
      ...product,
      scanDate: scanDate.toDate().getTime(),
    })
    setOpen(false)
  }

  return (
    <>
      <Button icon={<HistoryOutlined />} onClick={onClick}>
        历史记录
      </Button>
      <Drawer
        closable
        destroyOnClose
        title="历史记录"
        placement="right"
        open={open}
        loading={loading}
        width={560}
        onClose={() => setOpen(false)}
      >
        <List className="space-y-4">
          {exportList.length ? (
            exportList.map((item) => (
              <List.Item
                key={item.path}
                className="flex items-center justify-between text-xl"
              >
                <span>
                  <span>{item.name}</span>
                  {dayjs().isSame(item.date, 'D') && (
                    <span className="ml-1 text-sm text-black/40 dark:text-white/40">
                      (今天)
                    </span>
                  )}
                </span>
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    disabled={item.date.isSame(product.scanDate, 'D')}
                    onClick={() => onView(item.date)}
                  >
                    查看
                  </Button>
                  <Button
                    size="small"
                    disabled={!item.allowExport}
                    onClick={() => onExport(item.date)}
                  >
                    {item.allowExport ? '导出' : '暂无数据可导出'}
                  </Button>
                </Space>
              </List.Item>
            ))
          ) : (
            <Empty />
          )}
        </List>
      </Drawer>
      {holder}
    </>
  )
}

export default HistoryDawerButton
