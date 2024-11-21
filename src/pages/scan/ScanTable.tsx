import type { TableProps } from 'antd'
import { Card, Table, Tag } from 'antd'
import React, { useMemo, useState } from 'react'
import { DataType } from '../../types'
import dayjs from '../../utils/dayjs'
import SearchForm from './SearchForm'

const columns: TableProps<DataType>['columns'] = [
  {
    title: '产品名称',
    dataIndex: 'productName',
    key: 'productName',
    render: (text) => text,
  },
  {
    title: '产品编号',
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
  data: DataType[]
}> = ({ data }) => {
  const [input, setInput] = useState('')

  const filterDataSource = useMemo<DataType[]>(() => {
    return data.filter(
      (data) => data.qrcode.toLowerCase().indexOf(input?.toLowerCase()) !== -1,
    )
  }, [data, input])

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
      />
    </Card>
  )
}

export default ScanTable
