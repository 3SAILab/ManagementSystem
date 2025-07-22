export const menuItems = [
  
  {
    label: '基础信息',
    children: [
      { label: '工单看板', path: '/', icon: 'layout-dashboard' },
      { label: '我的任务', path: '/my_tasks', icon: 'check-square' },
      { label: '写日报', path: '/daily_report', icon: 'edit-2' },
    ]
  },
  {
    label: '人事管理',
    access: {
      roles: ['admin', 'manager', 'employee'],
      departments: ['人事行政部'],
      positions: ['HRBP']
    },
    children: [
      { label: '员工管理', path: '/employee_management', icon: 'users' },
      { label: '部门管理', path: '/department_management', icon: 'building-2' },
      { label: '职位管理', path: '/position_management', icon: 'briefcase' }
    ]
  },
  {
    label: '销售',
    access: {
      roles: ['admin', 'manager', 'employee'],
      departments: ['营销管理部'],
      positions: ['销售主管', '销售']
    },
    children: [
      { label: '我的看板', path: '/sales_dashboard', icon: 'bar-chart-3' },
      { label: '跟进记录', path: '/client_follow_ups', icon: 'contact' },
    ]
  },
  {
    label: '销售主管',
    access: {
      roles: ['manager'],
      positions: ['销售主管'],
      departments: ['营销管理部'],
    },
    children: [
      { label: '团队记录', path: '/team_record', icon: 'contact' },
    ]
  },
  {
    label: '工单分配',
    access: {
      roles: ['manager'],
      departments: ['生产部'],
      positions: ['美工主管', '渲染主管'],
    },
    children: [
      { label: '工单分配', path: '/work_assignment', icon: 'check-square' },
    ]
  }
];