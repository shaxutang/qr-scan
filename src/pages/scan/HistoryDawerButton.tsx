import {
  exportDatasource,
  exportScanDataExcel,
  getExoportList,
  openExportExplorer,
  readScanData,
} from '@/native'
import dayjs from '@/utils/dayjs'
import { ExportOutlined, HistoryOutlined } from '@ant-design/icons/lib'
import {
  Button,
  Checkbox,
  Drawer,
  Empty,
  Flex,
  List,
  message,
  Space,
} from 'antd'
import { Dayjs } from 'dayjs'
import { useState, useTransition } from 'react'
import { useProduct } from '../../store/product'

const HistoryDawerButton: React.FC = () => {
  const [exportList, setExportList] = useState<
    {
      name: string
      date: Dayjs
      path: string
    }[]
  >([])
  const [open, setOpen] = useState<boolean>(false)
  const [messageApi, holder] = message.useMessage()
  const { product, setProduct } = useProduct()
  const [selectedDays, setSelectedDays] = useState<Dayjs[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isBatchPending, startBatchTransition] = useTransition()
  const [isLoadDataPending, startLoadDataTransition] = useTransition()
  const onClick = async () => {
    setOpen(true)
    startLoadDataTransition(() => {
      getExoportList(product.productValue).then((list) => {
        let finalList = list
          .map((item) => {
            const dateStr = item.path.replace(/^.*[\\/]/, '')
            return {
              ...item,
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
          })
        }

        finalList.sort((a, b) => b.date.valueOf() - a.date.valueOf())
        setExportList(finalList)
      })
    })
  }

  const onExport = async (date: Dayjs, isLast: boolean = true) => {
    const dateStr = date.format('YYYY-MM-DD')
    const data = await readScanData(product.productValue, dateStr)

    const { success, message } = await exportScanDataExcel(
      product.productName,
      dateStr,
      data,
    )
    if (success) {
      isLast && messageApi.success(message)
      isLast && openExportExplorer(product.productName)
    } else {
      messageApi.error(`[${dateStr}]导出错误信息：${message}`)
    }
  }

  const onBatchExport = async () => {
    startBatchTransition(() => {
      selectedDays.forEach(async (day, index) =>
        onExport(day, index === selectedDays.length - 1),
      )
    })
  }

  const onView = (scanDate: Dayjs) => {
    setProduct({
      ...product,
      scanDate: scanDate.toDate().getTime(),
    })
    setOpen(false)
  }

  const onSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedDays(exportList.map((item) => item.date))
    } else {
      setSelectedDays([])
    }
    setSelectAll(checked)
  }

  const onExportDatasource = async () => {
    const { success, message } = await exportDatasource()
    if (success) {
      messageApi.success(message)
    } else {
      messageApi.error(`导出错误信息：${message}`)
    }
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
        loading={isLoadDataPending}
        width={560}
        extra={
          <Button type="primary" onClick={onExportDatasource}>
            导出数据源
          </Button>
        }
        onClose={() => setOpen(false)}
      >
        <Flex gap="small" className="mb-4">
          <label className="cursor-pointer">
            <Checkbox
              checked={selectAll}
              onChange={() => onSelectAllChange(!selectAll)}
            />
            <span className="ml-2">全选</span>
          </label>
          <Space size="middle" className="ml-auto">
            <div>已选择「{selectedDays.length}」项</div>
            <Button
              loading={isBatchPending}
              icon={<ExportOutlined />}
              disabled={!selectedDays.length}
              onClick={onBatchExport}
            >
              批量导出
            </Button>
          </Space>
        </Flex>
        <List className="space-y-4">
          {exportList.length ? (
            exportList.map((item) => (
              <List.Item key={item.path} className="flex items-center text-xl">
                <label className="flex cursor-pointer items-center text-xl">
                  <Checkbox
                    checked={selectedDays.some((day) =>
                      day.isSame(item.date, 'D'),
                    )}
                    onClick={() =>
                      setSelectedDays((prev) => [...prev, item.date])
                    }
                  />
                  <span className="ml-4">
                    <span>{item.name}</span>
                    {dayjs().isSame(item.date, 'D') && (
                      <span className="ml-1 text-sm text-black/40 dark:text-white/40">
                        (今天)
                      </span>
                    )}
                  </span>
                </label>
                <Space className="ml-auto">
                  <Button
                    type="primary"
                    size="small"
                    disabled={item.date.isSame(product.scanDate, 'D')}
                    onClick={() => onView(item.date)}
                  >
                    查看
                  </Button>
                  <Button size="small" onClick={() => onExport(item.date)}>
                    导出
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
