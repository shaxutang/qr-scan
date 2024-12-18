import { useDark } from '@/store/dark'
import { useFullscreen } from '@/store/fullscreen'
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  MoonOutlined,
  MoreOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { FloatButton } from 'antd'

const FloatButtons: React.FC = () => {
  const { isFullscreen, toggleFullscreenMode } = useFullscreen()
  const { isDark, toggleDarkMode } = useDark()

  return (
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ insetInlineEnd: 24 }}
      icon={<MoreOutlined />}
    >
      <FloatButton
        icon={isDark ? <MoonOutlined /> : <SunOutlined />}
        onClick={toggleDarkMode}
      />
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
