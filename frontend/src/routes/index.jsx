import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../views/auth/login/';
import DashboardPage from '../views/workorder/dashboard/';
import EmployeeManagementPage from '../views/organization/employee/';
import PrivateRoute from '../layout/PrivateRoute';
import Layout from '../layout/Layout';
import RequireAuth from '../layout/RequireAuth';
import DepartmentPage from '../views/organization/department/';
import PositionPage from '../views/organization/position/';
import SalesDashboard from '../views/sales/dashboard/';
import ClientFollowUps from '../views/sales/followups/';
import TeamRecordPage from '../views/team/record/';
import ContractDetailPage from '../views/workorder/contract/detail/'
import WorkAssignmentPage from '../views/workorder/assignment/'
import ResetPassword from '../views/auth/resetpassword/'
import TeamDashboardPage from '../views/team/dashboard/';
import SalesDataPages from '../views/datacenter/sales/'
import PendingReceivables from '../views/sales/receivables/'
import ReadOnlySalesDashboard from '../views/sales/readonly/'
import ReadOnlyContractDetail from '../views/workorder/contract/readonly/'
import ArtDataPage from '../views/datacenter/art/'
import OnlineClientPage from '../views/sales/onlineclient/'
import SalaryDataPage from '../views/datacenter/salary/'
import ProductTypeManagePage from '../views/organization/producttype/'
import ContractManagementPage from '../views/workorder/contract/management/'

const router = createBrowserRouter([
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/resetpassword',
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
            path: '/workorder/contract/readonly/:id',
            element: (
              <PrivateRoute currentPath='/workorder/contract/readonly'>
                <ReadOnlyContractDetail />
              </PrivateRoute>
            ),
            handle: { title: '合同详情' },
          },
          {
            path: '/sales/readonly/:id/:name',
            element: (
              <PrivateRoute currentPath='/sales/readonly'>
                <ReadOnlySalesDashboard />
              </PrivateRoute>
            ),
            handle: { title: `销售看板` },
          },
          {
            path: '/organization/employee',
            element: (
              <PrivateRoute currentPath='/organization/employee'>
                <EmployeeManagementPage />
              </PrivateRoute>
            ),
            handle: { title: '员工管理' },
          },
          {
            path: '/organization/department',
            element: (
              <PrivateRoute currentPath='/organization/department'>
                <DepartmentPage />
              </PrivateRoute>
            ),
            handle: { title: '部门管理' },
          },
          {
            path: '/organization/position',
            element: (
              <PrivateRoute currentPath='/organization/position'>
                <PositionPage />
              </PrivateRoute>
            ),
            handle: { title: '职位管理' },
          },
          {
            path: '/sales/dashboard',
            element: (
              <PrivateRoute currentPath='/sales/dashboard'>
                <SalesDashboard />
              </PrivateRoute>
            ),
            handle: { title: '我的看板' },
          },
          {
            path: '/sales/followups',
            element: (
              <PrivateRoute currentPath='/sales/followups'>
                <ClientFollowUps />
              </PrivateRoute>
            ),
            handle: { title: '跟进记录' },
          },
          {
            path: '/workorder/contract/detail/:id',
            element: (
              <PrivateRoute currentPath='/workorder/contract/detail'>
                <ContractDetailPage />
              </PrivateRoute>
            ),
            handle: { title: '合同详情' },
          },
          {
            path: '/team/record',
            element: (
              <PrivateRoute currentPath='/team/record'>
                <TeamRecordPage />
              </PrivateRoute>
            ),
            handle: { title: '团队记录' },
          },
          {
            path: '/workorder/assignment',
            element: (
              <PrivateRoute currentPath='/workorder/assignment'>
                <WorkAssignmentPage />
              </PrivateRoute>
            ),
            handle: { title: '工单分配' },
          },
          {
            path: '/team/dashboard',
            element:(
              <PrivateRoute currentPath='/team/dashboard'>
                <TeamDashboardPage />
              </PrivateRoute>
            ),
            handle: { title: '团队任务监控' }
          },
          {
            path: '/datacenter/sales',
            element: (
              <PrivateRoute currentPath='/datacenter/sales'>
                <SalesDataPages />
              </PrivateRoute>
            ),
            handle: { title: '销售数据' }
          },
          {
            path: '/sales/receivables',
            element: (
              <PrivateRoute currentPath='/sales/receivables'>
                <PendingReceivables />
              </PrivateRoute>
            ),
            handle: { title: '待催收尾款' }
          },
          {
            path: '/datacenter/art',
            element: (
              <PrivateRoute currentPath='/datacenter/art'>
                <ArtDataPage />
              </PrivateRoute>
            ),
            handle: { title: '生产数据' }
          },
          {
            path: '/sales/onlineclient',
            element: (
              <PrivateRoute currentPath='/sales/onlineclient'>
                <OnlineClientPage />
              </PrivateRoute>
            ),
            handle: { title: '线上客户' }
          },
          {
            path: '/datacenter/salary',
            element: (
              <PrivateRoute currentPath='/datacenter/salary'>
                <SalaryDataPage />
              </PrivateRoute>
            ),
            handle: { title: '薪资数据' }
          },
          {
            path: '/workorder/contract/management',
            element: (
              <PrivateRoute currentPath='/workorder/contract/management'>
                <ContractManagementPage />
              </PrivateRoute>
            ),
            handle: { title: '合同管理' }
          },
          {
            path: '/organization/producttype',
            element: (
              <PrivateRoute currentPath='/organization/producttype'>
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