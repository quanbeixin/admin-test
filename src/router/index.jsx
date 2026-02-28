import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Workbench from '../pages/Workbench';
import Projects from '../pages/Projects';
import Users from '../pages/Users';
import Tasks from '../pages/Tasks';
import Settings from '../pages/Settings';
import DashboardList from '../pages/DashboardList';
import DashboardPage from '../pages/DashboardPage';
import Login from '../pages/Login';
import ErrorPage from '../components/ErrorPage';
import PrivateRoute from '../components/PrivateRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/workbench" replace />,
      },
      {
        path: 'workbench',
        element: <Workbench />,
      },
      {
        path: 'dashboard-list',
        element: <DashboardList />,
      },
      {
        path: 'dashboard/:id',
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <Projects />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

export default router;
