import { createHashRouter } from 'react-router-dom'
import Home from './pages/home'
import Scan from './pages/scan'

export const router = createHashRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/scan',
      element: <Scan />,
    },
    {
      path: '/*',
      element: <Home />,
    },
  ],
  {
    future: {
      v7_partialHydration: true,
    },
  },
)
