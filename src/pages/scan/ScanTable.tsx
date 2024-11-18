import React from 'react';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { DataType } from '../../types';
import dayjs from '../../utils/dayjs';

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
];

const ScanTable: React.FC<{
  data: DataType[];
}> = ({ data }) => (
  <Table<DataType>
    columns={columns}
    dataSource={data}
    rowKey="qrcode"
    scroll={{ y: 500 }}
  />
);

export default ScanTable;
