import { useFullscreen } from '@/store/fullscreen'
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  MoreOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons'
import { FloatButton } from 'antd'
import { Link } from 'react-router-dom'

const FloatButtons: React.FC = () => {
  const { isFullscreen, toggleFullscreenMode } = useFullscreen()

  return (
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ insetInlineEnd: 24 }}
      icon={<MoreOutlined />}
    >
      <Link to="/rules">
        <FloatButton icon={<SecurityScanOutlined />} />
      </Link>
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
