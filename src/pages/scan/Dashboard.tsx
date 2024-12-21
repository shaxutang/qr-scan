import { useDark } from '@/store/dark'
import { useScan } from '@/store/scan'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Line } from '@ant-design/plots'
import { Card, Col, Empty, Row, Statistic } from 'antd'
import React from 'react'

const Dashboard: React.FC = () => {
  const { isDark } = useDark()

  const scan = useScan()

  const config = {
    theme: isDark ? 'classicDark' : 'classic',
    data: scan.charData,
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
          <div className="space-y-2 dark:text-white">
            {items.map((item: any) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
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
  const isGrowth = scan.growth >= 0
  const icon = isGrowth ? <ArrowUpOutlined /> : <ArrowDownOutlined />
  const valueStyle = {
    color: isGrowth ? '#3f8600' : '#cf1362',
    fontWeight: 400,
    fontSize: 36,
  }

  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前时间段产能"
              value={scan.lastHourCapacity}
              precision={0}
              valueStyle={{ fontWeight: 400, fontSize: 36 }}
              suffix="pcs"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总产能"
              value={scan.totalCapacity}
              valueStyle={{ fontWeight: 400, fontSize: 36 }}
              precision={0}
              suffix="pcs"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="生产速度"
              value={scan.speed.toFixed(2)}
              precision={2}
              valueStyle={{ color: '#1677ff', fontWeight: 400, fontSize: 36 }}
              suffix="pcs /小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="小时产能同比增长"
              value={scan.growth.toFixed(2)}
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
        {scan.charData.length ? <Line {...config} /> : <Empty />}
      </Card>
    </>
  )
}

export default Dashboard
