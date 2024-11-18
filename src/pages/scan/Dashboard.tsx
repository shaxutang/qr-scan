import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Line } from '@ant-design/plots'
import { Card, Col, Row, Statistic } from 'antd'
import React from 'react'
import { DataType } from '../../types'
import dayjs from '../../utils/dayjs'
/**
 * 根据数据中的日期字段，将数据数组按小时分组
 * @param data 数据数组，包含带有日期字段的多个数据对象
 * @returns 返回一个对象，其中每个键代表一个小时，值是属于该小时的数据数组
 */
const groupByHour = (data: DataType[]): { [key: string]: DataType[] } => {
  // 初始化一个空对象用于存储分组后的数据
  const grouped: { [key: string]: DataType[] } = {}

  // 遍历数据数组中的每个项目
  data.forEach((item) => {
    // 使用dayjs库将日期格式化为'YYYY/MM/DD HH:00:00'，以实现按小时分组
    const hour = dayjs(item.date).format('YYYY/MM/DD HH:00:00')

    // 检查当前小时是否已初始化，如果未初始化则创建一个空数组
    if (!grouped[hour]) {
      grouped[hour] = []
    }

    // 将当前数据项添加到对应的小时分组中
    grouped[hour].push(item)
  })

  // 返回按小时分组的数据对象
  return grouped
}

/**
 * 计算容量信息
 * 该函数根据给定的数据集计算当前小时的容量、与上一个小时容量的对比增长率以及总容量
 *
 * @param data 数据数组，包含多个数据点，每个数据点应包含时间信息
 * @returns 返回一个对象，包含当前小时容量、增长率和总容量
 */
const calculateCapacity = (
  data: DataType[],
  grouped?: Record<string, DataType[]>,
) => {
  // 按小时分组数据
  const groupedData = grouped ?? groupByHour(data)
  // 获取所有小时的键值
  const hours = Object.keys(groupedData)
  // 获取当前处理的第一个小时
  const currentHour = hours[0]
  // 获取当前处理的前一个小时
  const previousHour = hours[1]
  // 获取当前小时的数据，如果没有则为空数组
  const currentHourData = groupedData[currentHour] || []
  // 获取前一个小时的数据，如果没有则为空数组
  const previousHourData = groupedData[previousHour] || []
  // 计算当前小时的容量
  const currentHourCapacity = currentHourData.length
  // 计算前一个小时的容量
  const previousHourCapacity = previousHourData.length
  // 计算容量增长率，如果前一个小时的容量不为零，则计算增长率，否则为0
  const growth = previousHourCapacity
    ? ((currentHourCapacity - previousHourCapacity) / previousHourCapacity) *
      100
    : 0

  const productionSpeed = hours.length
    ? hours.reduce((sum, hour) => {
        return sum + groupedData[hour]?.length || 0
      }, 0) / hours.length
    : 0
  // 返回容量信息，包括当前小时容量、增长率和总容量
  return {
    currentHourCapacity,
    previousHourCapacity,
    growth,
    totalCapacity: data.length,
    productionSpeed,
  }
}

const generateChartData = (grouped: Record<string, DataType[]>) => {
  return Object.entries(grouped)
    .map(([time, data]) => ({
      time: dayjs(time).format('HH:mm'),
      capacity: data.length,
    }))
    .sort(
      (c1, c2) =>
        dayjs(c1.time, 'HH:mm').valueOf() - dayjs(c2.time, 'HH:mm').valueOf(),
    )
}

const Dashboard: React.FC<{ data: DataType[] }> = ({ data }) => {
  const grouped = groupByHour(data)
  const { currentHourCapacity, productionSpeed, growth, totalCapacity } =
    calculateCapacity(data, grouped)
  const chartData = generateChartData(grouped)
  const config = {
    data: chartData,
    xField: 'time',
    yField: 'capacity',
    legend: {
      formatter: (text: string) => `${text} （单位：个）`,
    },
    point: {
      shapeField: 'square',
      sizeField: 4,
    },
    interaction: {
      tooltip: {
        marker: false,
        render: (event: any, { title, items }: any) => (
          <div className="space-y-2">
            {items.map((item: any) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-base"
              >
                <div>{item.name === 'capacity' ? '产能' : '时间'}</div>
                <div>
                  {item.value}
                  {item.name === 'capacity' ? '\tpcs' : ''}
                </div>
              </div>
            ))}
          </div>
        ),
      },
    },
    style: {
      lineWidth: 2,
    },
  }

  // 动态设置图标和样式
  const isGrowth = growth >= 0
  const icon = isGrowth ? <ArrowUpOutlined /> : <ArrowDownOutlined />
  const valueStyle = {
    color: isGrowth ? '#3f8600' : '#cf1322',
  }

  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前时间段产能"
              value={currentHourCapacity}
              precision={0}
              valueStyle={{ color: '#000' }}
              suffix="pcs"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总产能"
              value={totalCapacity}
              precision={0}
              suffix="pcs"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="生产速度"
              value={productionSpeed.toFixed(2)}
              precision={2}
              valueStyle={{ color: '#1677ff' }}
              suffix="pcs /小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="小时产能同比增长"
              value={growth.toFixed(2)}
              precision={2}
              valueStyle={valueStyle}
              prefix={icon}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
      <Card
        size="small"
        title="小时产能分布图"
        styles={{
          header: {
            fontWeight: 400,
          },
        }}
        className="mt-4"
      >
        <Line {...config} />
      </Card>
    </>
  )
}

export default Dashboard
