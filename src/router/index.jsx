import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Workbench from '../pages/Workbench';
import Projects from '../pages/Projects';
import Users from '../pages/Users';
import Tasks from '../pages/Tasks';
import Settings from '../pages/Settings';
import DashboardList from '../pages/DashboardList';
import DashboardPage from '../pages/DashboardPage';
import AdCreativeList from '../pages/AdCreativeList';
import AdData from '../pages/AdData';
import AdDataTable from '../pages/AdDataTable';
import AdAccountManagement from '../pages/AdAccountManagement';
import CompanyManagement from '../pages/CompanyManagement';
import DataSync from '../pages/DataSync';
import PlatformFieldConfig from '../pages/PlatformFieldConfig';
import AutomatedTest from '../pages/AutomatedTest';
import TestCaseManagement from '../pages/TestCaseManagement';
import TestTaskList from '../pages/TestTaskList';
import TestTaskDetail from '../pages/TestTaskDetail';
import TrendsDashboard from '../pages/TrendsDashboard';
import HotTopicList from '../pages/HotTopicList';
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
        path: 'ad-creatives',
        element: <AdCreativeList />,
      },
      {
        path: 'ad-data',
        element: <AdData />,
      },
      {
        path: 'ad-data-table',
        element: <AdDataTable />,
      },
      {
        path: 'ad-account-management',
        element: <AdAccountManagement />,
      },
      {
        path: 'data-sync',
        element: <DataSync />,
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
        path: 'automated-test',
        element: <AutomatedTest />,
      },
      {
        path: 'test-case-management',
        element: <TestCaseManagement />,
      },
      {
        path: 'test-tasks',
        element: <TestTaskList />,
      },
      {
        path: 'test-task/:id',
        element: <TestTaskDetail />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'platform-field-config',
        element: <PlatformFieldConfig />,
      },
      {
        path: 'company-management',
        element: <CompanyManagement />,
      },
      {
        path: 'trends-dashboard',
        element: <TrendsDashboard />,
      },
      {
        path: 'hot-topic-list',
        element: <HotTopicList />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

export default router;
