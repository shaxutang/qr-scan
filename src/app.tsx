import { ConfigProvider, FloatButton, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { useDark } from './store/dark'
import { FullscreenExitOutlined, FullscreenOutlined, MoreOutlined } from '@ant-design/icons'
import { useFullscreen } from './store/fullscreen'

const root = createRoot(document.getElementById('root'))

const App = () => {
  const { isDark } = useDark()
  const { isFullscreen, toggleFullscreenMode } = useFullscreen();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <RouterProvider router={router} />
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 24 }}
        icon={<MoreOutlined />}
      >
        <FloatButton icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={toggleFullscreenMode} />
      </FloatButton.Group>
    </ConfigProvider>
  )
}

root.render(<App />)
