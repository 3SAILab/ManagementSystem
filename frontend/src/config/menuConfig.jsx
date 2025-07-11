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
      departments: ['人力资源部'],
      positions: ['人事']
    },
    children: [
      { label: '员工管理', path: '/employee_management', icon: 'users' },
      { label: '人事档案', path: '/personnel_file', icon: 'contact-2' },
      { label: '部门管理', path: '/department_management', icon: 'building-2' },
      { label: '职位管理', path: '/position_management', icon: 'briefcase' }
    ]
  },
];