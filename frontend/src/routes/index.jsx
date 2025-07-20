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
import SalesDashboard from '../pages/SalesDashboard';
import ClientFollowUps from '../pages/ClientFollowUps';
import ContractDetailPage from '../pages/ContractDetailPage'

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
            path: 'sales_dashboard',
            element: (
              <PrivateRoute currentPath='sales_dashboard'>
                <SalesDashboard />
              </PrivateRoute>
            ),
            handle: { title: '我的看板' },
          },
          {
            path: 'client_follow_ups',
            element: (
              <PrivateRoute currentPath='client_follow_ups'>
                <ClientFollowUps />
              </PrivateRoute>
            ),
            handle: { title: '跟进记录' },
          },
          {
            path: 'contract_detail/:id',
            element: (
              <PrivateRoute currentPath='contract_detail'>
                <ContractDetailPage />
              </PrivateRoute>
            ),
            handle: { title: '合同详情' },
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