import { createHashRouter } from 'react-router-dom';
import Scan from './pages/scan';
import Home from './pages/home';

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
  ],
  {
    future: {
      v7_partialHydration: true,
    },
  }
);
