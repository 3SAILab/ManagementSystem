import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import EmployeeManagementPage from '../pages/EmployeeManagementPage';
import PrivateRoute from '../components/PrivateRoute';
import Layout from '../components/Layout';
import RequireAuth from '../components/RequireAuth';
import DepartmentPage from '../pages/DepartmentPage';
import PositionPage from '../pages/PositionPage';
import SalesDashboard from '../pages/SalesDashboard';
import ClientFollowUps from '../pages/ClientFollowUps';
import TeamRecordPage from '../pages/TeamRecordPage';
import ContractDetailPage from '../pages/ContractDetailPage'
import WorkAssignmentPage from '../pages/WorkAssignmentPage'
import ResetPassword from '../pages/ResetPassword'
import TeamDashboardPage from '../pages/TeamDashboard';
import SalesDataPages from '../pages/SalesDataPages'
import PendingReceivables from '../pages/PendingReceivables'
import ReadOnlySalesDashboard from '../pages/ReadOnlySalesDashboard'
import ReadOnlyContractDetail from '../pages/ReadOnlyContractDetail'
import ArtDataPage from '../pages/ArtDataPage'
import OnlineClientPage from '../pages/OnlineClientPage'
import SalaryDataPage from '../pages/SalaryData'
import ProductTypeManagePage from '../pages/ProductTypeManagePage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />, 
  },
  {
    path: '/reset_password',
    element: <ResetPassword />,
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
            element: (
              <PrivateRoute currentPath="/">
                <DashboardPage />
              </PrivateRoute>
            ),
            handle: { title: '工单看板' },
          },
          {
            path: 'readonly_contract_detail/:id',
            element: (
              <PrivateRoute currentPath='readonly_contract_detail'>
                <ReadOnlyContractDetail />
              </PrivateRoute>
            ),
            handle: { title: '合同详情' },
          },
          {
            path: 'readonly_sales_dashboard/:id/:name',
            element: (
              <PrivateRoute currentPath='readonly_sales_dashboard'>
                <ReadOnlySalesDashboard />
              </PrivateRoute>
            ),
            handle: { title: `销售看板` },
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
          },
          {
            path: 'team_record',
            element: (
              <PrivateRoute currentPath='team_record'>
                <TeamRecordPage />
              </PrivateRoute>
            ),
            handle: { title: '团队记录' },
          },
          {
            path: 'work_assignment',
            element: (
              <PrivateRoute currentPath='work_assignment'>
                <WorkAssignmentPage />
              </PrivateRoute>
            ),
            handle: { title: '工单分配' },
          },
          {
            path: 'team_dashboard',
            element:(
              <PrivateRoute currentPath='team_record'>
                <TeamDashboardPage />
              </PrivateRoute>
            ),
            handle: { title: '团队任务监控' }
          },
          {
            path: 'sales_data',
            element: (
              <PrivateRoute currentPath='sales_data'>
                <SalesDataPages />
              </PrivateRoute>
            ),
            handle: { title: '销售数据' }
          },
          {
            path: 'pending_receivables',
            element: (
              <PrivateRoute currentPath='pending_receivables'>
                <PendingReceivables />
              </PrivateRoute>
            ),
            handle: { title: '待催收尾款' }
          },
          {
            path: 'production_data',
            element: (
              <PrivateRoute currentPath='production_data'>
                <ArtDataPage />
              </PrivateRoute>
            ),
            handle: { title: '生产数据' }
          },
          {
            path: 'online_client',
            element: (
              <PrivateRoute currentPath='online_client'>
                <OnlineClientPage />
              </PrivateRoute>
            ),
            handle: { title: '线上客户' }
          },
          {
            path: 'salary_data',
            element: (
              <PrivateRoute currentPath='salary_data'>
                <SalaryDataPage />
              </PrivateRoute>
            ),
            handle: { title: '薪资数据' }
          },
          {
            path: 'product_type_management',
            element: (
              <PrivateRoute currentPath='product_type_management'>
                <ProductTypeManagePage />
              </PrivateRoute>
            ),
            handle: { title: '产品类型管理' }
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