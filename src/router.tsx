import { createHashRouter } from 'react-router-dom'
import Home from './pages/home'
import Products from './pages/products'
import Scan from './pages/scan'
import Rules from './pages/rules'

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
    { path: '/products', element: <Products /> },
    { path: '/rules', element: <Rules /> },
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
