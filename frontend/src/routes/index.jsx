import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import MyTasksPage from '../pages/MyTasksPage';
import EmployeeManagementPage from '../pages/EmployeeManagementPage';
import PrivateRoute from '../components/PrivateRoute';
import Layout from '../components/Layout';
import RequireAuth from '../components/RequireAuth';
import DepartmentPage from '../pages/DepartmentPage';
import PositionPage from '../pages/PositionPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />, 
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Layout />, 
        children: [
          {
            index: true,
            element: <DashboardPage />, 
            meta: { title: '工单看板' },
          },
          {
            path: 'my_tasks',
            element: (
              <PrivateRoute currentPath='my_tasks'>
                <MyTasksPage />
              </PrivateRoute>
            ),
            meta: { title: '我的任务' },
          },
          {
            path: 'employee_management',
            element: (
              <PrivateRoute currentPath='employee_management'>
                <EmployeeManagementPage />
              </PrivateRoute>
            ),
            meta: { title: '员工管理' },
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  },
]);

export default router;