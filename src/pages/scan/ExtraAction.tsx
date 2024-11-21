import { SettingOutlined } from '@ant-design/icons'
import { Button, Space } from 'antd'
import HistoryDawerButton from './HistoryDawerButton'

const ExtraAction: React.FC = () => {
  return (
    <Space>
      <HistoryDawerButton />
      <Button icon={<SettingOutlined />}></Button>
    </Space>
  )
}

export default ExtraAction
