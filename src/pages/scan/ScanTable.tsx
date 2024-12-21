import { useScan } from '@/store/scan'
import type { TableProps } from 'antd'
import { Button, Card, Popconfirm, Switch, Table, Tag } from 'antd'
import React, { useMemo, useState } from 'react'
import { DataType } from '../../types'
import dayjs from '../../utils/dayjs'
import SearchForm from './SearchForm'

const columns: TableProps<DataType>['columns'] = [
  {
    title: '扫码对象名称',
    dataIndex: 'productName',
    key: 'productName',
    render: (text) => text,
  },
  {
    title: '扫码对象编号',
    dataIndex: 'qrcode',
    key: 'qrcode',
    render: (text) => text,
  },
  {
    title: '测试状态',
    key: 'state',
    dataIndex: 'state',
    render: () => <Tag color="success">测试通过</Tag>,
  },
  {
    title: '测试时间',
    key: 'date',
    render: ({ date }) => dayjs(date).format('YYYY/MM/DD HH:mm:ss'),
  },
]

const ScanTable: React.FC<{
  onDelete?: (qrcode: string) => void
}> = ({ onDelete }) => {
  const scan = useScan()
  const [input, setInput] = useState('')
  const [advanced, setAdvanced] = useState(false)

  const filterDataSource = useMemo<DataType[]>(() => {
    return scan
      .getFlatDatas()
      .filter(
        (data) =>
          data.qrcode.toLowerCase().indexOf(input?.toLowerCase()) !== -1,
      )
  }, [input, scan.totalCapacity])

  const getColumns = () => {
    return advanced
      ? [
          ...columns,
          {
            title: '操作',
            key: 'action',
            render: (_: any, record: DataType) => (
              <>
                <Popconfirm
                  title="确定要删除吗？"
                  description="删除之后不可恢复！"
                  onConfirm={() => onDelete?.(record.qrcode)}
                >
                  <Button type="primary" size="small" danger>
                    删除
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]
      : columns
  }
  const onSearch = (qrcode: string) => {
    setInput(qrcode)
  }

  const onReset = () => {
    setInput('')
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <SearchForm value={input} onSubmit={onSearch} onReset={onReset} />
        <div className="flex items-center gap-x-2">
          <div>高级操作:</div>
          <Switch value={advanced} onChange={setAdvanced} />
        </div>
      </div>
      <Table<DataType>
        columns={getColumns()}
        dataSource={filterDataSource}
        rowKey="qrcode"
        scroll={{ y: 500 }}
        pagination={{
          total: scan.totalCapacity,
          showTotal: (total) => `共 ${total} 条数据`,
          onChange: (page) => {
            scan.getByPage(page)
          },
        }}
      />
    </Card>
  )
}

export default ScanTable
