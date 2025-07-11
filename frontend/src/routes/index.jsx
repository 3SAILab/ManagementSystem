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
import DailyReportPage from '../pages/DailyReportPage';
import PersonnelFilePage from '../pages/PersonnelFilePage';

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
            handle: { title: '工单看板' },
          },
          {
            path: 'my_tasks',
            element: (
              <PrivateRoute currentPath='my_tasks'>
                <MyTasksPage />
              </PrivateRoute>
            ),
            handle: { title: '我的任务' },
          },
          {
            path: 'daily_report',
            element: (
              <PrivateRoute currentPath='daily_report'>
                <DailyReportPage />
              </PrivateRoute>
            ),
            handle: { title: '写日报' },
          },
          {
            path: 'employee_management',
            element: (
              <PrivateRoute currentPath='employee_management'>
                <EmployeeManagementPage />
              </PrivateRoute>
            ),
            handle: { title: '员工管理' },
          },
          {
            path: 'department_management',
            element: (
              <PrivateRoute currentPath='department_management'>
                <DepartmentPage />
              </PrivateRoute>
            ),
            handle: { title: '部门管理' },
          },
          {
            path: 'position_management',
            element: (
              <PrivateRoute currentPath='position_management'>
                <PositionPage />
              </PrivateRoute>
            ),
            handle: { title: '职位管理' },
          },
          {
            path: 'personnel_file',
            element: (
              <PrivateRoute currentPath='personnel_file'>
                <PersonnelFilePage />
              </PrivateRoute>
            ),
            handle: { title: '人事档案' },
          }
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