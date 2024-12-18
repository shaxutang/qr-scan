import { useFullscreen } from '@/store/fullscreen'
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { FloatButton } from 'antd'

const FloatButtons: React.FC = () => {
  const { isFullscreen, toggleFullscreenMode } = useFullscreen()

  return (
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ insetInlineEnd: 24 }}
      icon={<MoreOutlined />}
    >
      <FloatButton
        icon={
          isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
        }
        onClick={toggleFullscreenMode}
      />
    </FloatButton.Group>
  )
}

export default FloatButtons
