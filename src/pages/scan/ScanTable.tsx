import { useScan } from '@/store/scan'
import type { TableProps } from 'antd'
import { Card, Table, Tag } from 'antd'
import React, { useState } from 'react'
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

const ScanTable: React.FC<{}> = () => {
  const scan = useScan()
  const [input, setInput] = useState('')
  const [pageNum, setPageNum] = useState(1)

  const filterDataSource = scan.getByPage(pageNum, input)

  const onSearch = (qrcode: string) => {
    setInput(qrcode)
  }

  const onReset = () => {
    setInput('')
  }

  return (
    <Card>
      <div className="mb-4">
        <SearchForm value={input} onSubmit={onSearch} onReset={onReset} />
      </div>
      <Table<DataType>
        columns={columns}
        dataSource={filterDataSource}
        rowKey="qrcode"
        scroll={{ y: 500 }}
        pagination={{
          current: pageNum,
          total: scan.totalCapacity,
          pageSizeOptions: [],
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条数据`,
          onChange: (page) => {
            setPageNum(page)
          },
        }}
      />
    </Card>
  )
}

export default ScanTable
