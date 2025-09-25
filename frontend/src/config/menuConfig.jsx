export const menuItems = [
  
  {
    label: '工单看板',
    access: {
      roles: ['admin', 'manager', 'employee'],
      departments: ['生产部'],
      positions: ['美工','渲染']
    },
    children: [
      { label: '工单看板', path: '/', icon: 'layout-dashboard' },
    ]
  },
  {
    label: '人事管理',
    access: {
      roles: ['admin', 'manager'],
      departments: ['人事行政部'],
      positions: ['人事专员']
    },
    children: [
      { label: '员工管理', path: '/employee_management', icon: 'users' },
      { label: '部门管理', path: '/department_management', icon: 'building-2' },
      { label: '职位管理', path: '/position_management', icon: 'briefcase' },
      { label: '销售数据', path: '/sales_data', icon: 'bar-chart-3' },
      { label: '生产数据', path: '/production_data', icon: 'bar-chart-3' },
    ]
  },
  {
    label: '销售',
    access: {
      roles: ['owner', 'admin', 'manager', 'employee'],
      departments: ['营销管理部'],
      positions: ['销售']
    },
    children: [
      { label: '我的看板', path: '/sales_dashboard', icon: 'bar-chart-3' },
      { label: '跟进记录', path: '/client_follow_ups', icon: 'contact' },
    ]
  },
  {
    label: '销售组长',
    access: {
      roles: ['manager'],
      positions: ['销售'],
      departments: ['营销管理部'],
    },
    children: [
      { label: '团队记录', path: '/team_record', icon: 'contact' },
      { label: '销售数据', path: '/sales_data', icon: 'bar-chart-3' },
    ]
  },
  {
    label: '销售总负责人',
    access: {
      roles: ['owner'],
      positions: ['销售'],
      departments: ['营销管理部'],
    },
    children: [
      { label: '团队记录', path: '/team_record', icon: 'contact' },
    ]
  },
  {
    label: '运营',
    access: {
      roles: ['owner', 'admin', 'manager', 'employee'],
      positions: ['运营'],
      departments: ['营销管理部'],
    },
    children: [
      { label: '线上客户', path: '/online_client', icon: 'contact' },
      { label: '销售数据', path: '/sales_data', icon: 'bar-chart-3' },
      { label: '我的看板', path: '/sales_dashboard', icon: 'bar-chart-3' },
      { label: '跟进记录', path: '/client_follow_ups', icon: 'contact' },
    ]
  },
  {
    label: '美工主管',
    access: {
      roles: ['manager'],
      departments: ['生产部'],
      positions: ['美工'],
    },
    children: [
      { label: '合同管理', path: '/contract_management', icon: 'file-text' },  // 新增合同管理
      { label: '工单分配', path: '/work_assignment', icon: 'check-square' },
      { label: '团队任务监控', path: '/team_dashboard', icon: 'contact' },
      { label: '生产数据', path: '/production_data', icon: 'bar-chart-3' },
    ]
  },
  {
    label: '渲染主管',
    access: {
      roles: ['manager'],
      departments: ['生产部'],
      positions: ['渲染'],
    },
    children: [
      { label: '工单分配', path: '/work_assignment', icon: 'check-square' },
      { label: '团队任务监控', path: '/team_dashboard', icon: 'contact' },
      { label: '生产数据', path: '/production_data', icon: 'bar-chart-3' },
    ]
  },
  {
    label: '生产总负责人',
    access: {
      roles: ['owner'],
      departments: ['生产部'],
    },
    children: [
      { label: '工单分配', path: '/work_assignment', icon: 'check-square' },
      { label: '产品类型管理', path: '/product_type_management', icon: 'tag' },
      { label: '合同管理', path: '/contract_management', icon: 'file-text' },  // 新增合同管理
    ]
  },
  {
    label: '统计看板',
    access: {
      roles: ['owner'],
    },
    children: [
      { label: '销售数据', path: '/sales_data', icon: 'bar-chart-3' },
      { label: '生产数据', path: '/production_data', icon: 'bar-chart-3' },
      { label: '团队任务监控', path: '/team_dashboard', icon: 'contact' },
    ]
  },

];