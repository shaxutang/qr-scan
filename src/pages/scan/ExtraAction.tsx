import {
  exportScanDataExcel,
  getExoportList,
  openExportExplorer,
  readScanData,
} from '@/native'
import { ExportOutlined } from '@ant-design/icons/lib'
import { Button, Drawer, Empty, List, message } from 'antd'
import { useState } from 'react'
import { useScan } from '../../store/product'
import { DataType } from '../../types'

const ExtraAction: React.FC<{ data: DataType[] }> = ({ data }) => {
  const [exportList, setExportList] = useState<
    {
      name: string
      path: string
    }[]
  >([])
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [messageApi, holder] = message.useMessage()
  const { product } = useScan()

  const onClick = async () => {
    setOpen(true)
    setLoading(true)
    const list = await getExoportList(product.productValue)
    setExportList(list)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const onExport = async (path: string) => {
    const date = path.replace(/^.*[\\/]/, '')
    const data = await readScanData(product.productValue, date)
    if (!data.length) {
      messageApi.info('至少要有一条数据')
      return
    }
    const { success, message } = await exportScanDataExcel(
      product.productName,
      date,
      data,
    )
    if (success) {
      messageApi.success(message)
      openExportExplorer(product.productName, date)
    } else {
      messageApi.error(message)
    }
  }

  return (
    <>
      <Button icon={<ExportOutlined />} onClick={onClick}>
        导出
      </Button>
      <Drawer
        closable
        destroyOnClose
        title="可导出记录"
        placement="right"
        open={open}
        loading={loading}
        onClose={() => setOpen(false)}
      >
        <List className="space-y-4">
          {exportList.length ? (
            exportList.map((item) => (
              <List.Item
                key={item.path}
                className="flex items-center justify-between text-xl"
              >
                <span>{item.name}</span>
                <Button size="small" onClick={() => onExport(item.path)}>
                  导出
                </Button>
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

export default ExtraAction
