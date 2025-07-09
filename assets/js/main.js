lucide.createIcons();
        
// --- Typewriter Effect ---
const Typewriter = {
    init() {
        const target = document.getElementById('typewriter-text');
        if (!target) return;

        const phrases = [
            "智能驱动，<br>精准管理绩效。",
            "协同创作，<br>效率倍增。",
            "数据洞察，<br>驱动决策。"
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentPhrase = phrases[phraseIndex];
            let typeSpeed = isDeleting ? 60 : 120;

            if (isDeleting) {
                const content = currentPhrase.substring(0, charIndex);
                if (content.endsWith('>')) {
                    const tagStartIndex = content.lastIndexOf('<');
                    charIndex = tagStartIndex;
                } else {
                    charIndex--;
                }
                 target.innerHTML = currentPhrase.substring(0, charIndex);
            } else { // Typing
                if (currentPhrase.charAt(charIndex) === '<') {
                    const tagEndIndex = currentPhrase.indexOf('>', charIndex);
                    charIndex = tagEndIndex + 1;
                } else {
                    charIndex++;
                }
                target.innerHTML = currentPhrase.substring(0, charIndex);
            }

            if (!isDeleting && charIndex >= currentPhrase.length) {
                charIndex = currentPhrase.length;
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex <= 0) {
                charIndex = 0;
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500;
            }
            setTimeout(type, typeSpeed);
        }
        type();
    }
};
Typewriter.init();

function getPastDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
}

// --- 数据模拟 ---
const MOCK_DATA = {
    users: {
        'user_sales_wang': { userId: 'user_sales_wang', name: '王五', role: 'sales', departmentId: 'dept_sales', initials: 'WW', email: 'wang.wu@example.com', gender: '男', dob: '1990-05-20', hireDate: '2022-01-10', supervisorId: 'user_prod_zhao', onProbation: false, contractInfo: '标准劳动合同, 3年期, 2022-01-10 至 2025-01-09', salaryRecords: '2022: 月薪10k; 2023: 提升至12k', performanceReviews: '2023 Q4: 业绩超额完成, 沟通能力强', roleLevel: '普通员工', emergency_contact: { name: '王父', phone: '13800138001' } },
        'user_prod_zhao': { userId: 'user_prod_zhao', name: '赵六', role: 'prod_manager', departmentId: 'dept_prod', initials: 'ZL', email: 'zhao.liu@example.com', gender: '男', dob: '1985-11-15', hireDate: '2020-03-01', supervisorId: 'user_supervisor_zhou', onProbation: false, contractInfo: '高级管理合同, 5年期', salaryRecords: '2020: 月薪20k; 2022: 提升至25k', performanceReviews: '项目管理能力突出, 跨部门协调顺畅', roleLevel: '主管', emergency_contact: { name: '赵妻', phone: '13800138002' } },
        'user_art_li': { userId: 'user_art_li', name: '李四', role: 'art_lead', departmentId: 'dept_art', initials: 'LS', email: 'li.si@example.com', gender: '女', dob: '1992-07-22', hireDate: '2021-06-15', supervisorId: 'user_prod_zhao', onProbation: false, contractInfo: '标准劳动合同, 3年期', salaryRecords: '2021: 月薪15k; 2023: 提升至18k', performanceReviews: '设计作品质量高, 团队领导力有待加强', roleLevel: '组长', emergency_contact: { name: '李母', phone: '13800138003' } },
        'user_art_zhang': { userId: 'user_art_zhang', name: '张三', role: 'art_staff', departmentId: 'dept_art', initials: 'ZS', email: 'zhang.san@example.com', gender: '男', dob: '1995-02-18', hireDate: '2023-08-01', supervisorId: 'user_art_li', onProbation: true, contractInfo: '试用期合同, 6个月', salaryRecords: '2023: 试用期月薪8k', performanceReviews: '新人上手快, 积极主动', roleLevel: '普通员工', emergency_contact: { name: '张父', phone: '13800138004' } },
        'user_render_sun': { userId: 'user_render_sun', name: '孙七', role: 'render_staff', departmentId: 'dept_render', initials: 'SQ', email: 'sun.qi@example.com', gender: '女', dob: '1993-10-30', hireDate: '2022-11-20', supervisorId: 'user_prod_zhao', onProbation: false, contractInfo: '标准劳动合同, 2年期', salaryRecords: '2022: 月薪12k', performanceReviews: '渲染技术扎实, 能按时完成任务', roleLevel: '普通员工', emergency_contact: { name: '孙母', phone: '13800138005' } },
        'user_supervisor_zhou': { userId: 'user_supervisor_zhou', name: '周一', role: 'kanban_supervisor', departmentId: 'dept_mgmt', initials: 'ZY', email: 'zhou.yi@example.com', gender: '男', dob: '1980-01-01', hireDate: '2018-05-01', supervisorId: null, onProbation: false, contractInfo: '无固定期限劳动合同', salaryRecords: '薪酬保密', performanceReviews: '战略眼光独到, 公司业绩贡献巨大', roleLevel: '主管', emergency_contact: { name: '周妻', phone: '13800138006' } },
        'user_hr_chen': { userId: 'user_hr_chen', name: '陈HR', role: 'hr', departmentId: 'dept_hr', initials: 'HR', email: 'chen.hr@example.com', gender: '女', dob: '1888-08-08', hireDate: '2019-01-01', supervisorId: null, onProbation: false, contractInfo: '标准劳动合同, 5年期', salaryRecords: '薪酬保密', performanceReviews: '人事工作处理得当, 员工关系良好', roleLevel: '普通员工', emergency_contact: { name: '陈先生', phone: '13800138007' } },
    },
    clients: {
        'client_1': { clientId: 'client_1', name: '时尚潮流服饰', contactName: '陈经理', contactPhone: '13812345671', depositPaid: 2000 },
        'client_2': { clientId: 'client_2', name: '智能家居生活馆', contactName: '李总', contactPhone: '13912345672', depositPaid: 5000 },
        'client_3': { clientId: 'client_3', name: '美味零食铺', contactName: '张小姐', contactPhone: '13712345673', depositPaid: 300 },
    },
    departments: {
        'dept_sales': { departmentId: 'dept_sales', name: '销售部' },
        'dept_prod': { departmentId: 'dept_prod', name: '生产部' },
        'dept_art': { departmentId: 'dept_art', name: '美工部' },
        'dept_render': { departmentId: 'dept_render', name: '渲染部' },
        'dept_mgmt': { departmentId: 'dept_mgmt', name: '管理部' },
        'dept_hr': { departmentId: 'dept_hr', name: '人事部' },
        'dept_design': { departmentId: 'dept_design', name: '设计部' },
        'dept_hr': { departmentId: 'dept_hr', name: '人力资源部' },
    },
    positions: {
        'pos_fe': { positionId: 'pos_fe', name: '前端开发工程师', departmentId: 'dept_tech' },
        'pos_be': { positionId: 'pos_be', name: '后端开发工程师', departmentId: 'dept_tech' },
        'pos_uiux': { positionId: 'pos_uiux', name: 'UI/UX设计师', departmentId: 'dept_design' },
        'pos_pm': { positionId: 'pos_pm', name: '产品经理', departmentId: 'dept_prod' },
        'pos_art': { positionId: 'pos_art', name: '美术设计师', departmentId: 'dept_design' },
        'pos_sales': { positionId: 'pos_sales', name: '销售代表', departmentId: 'dept_sales' },
        'pos_cs': { positionId: 'pos_cs', name: '客户成功经理', departmentId: 'dept_sales' },
        'pos_hr': { positionId: 'pos_hr', name: '人力资源专员', departmentId: 'dept_hr' },
    },
    follow_ups: [
        { followUpId: 'fu_1', clientId: 'client_1', salesId: 'user_sales_wang', followUpDate: getPastDate(5).toISOString().split('T')[0], type: 'call', notes: '沟通了夏季新品的设计风格，客户表示满意。' },
        { followUpId: 'fu_2', clientId: 'client_2', salesId: 'user_sales_wang', followUpDate: getPastDate(2).toISOString().split('T')[0], type: 'visit', notes: '上门拜访，展示了渲染案例，客户意向明确。' },
    ],
    product_categories: ['手机', '电风扇', '服装', '零食', '智能家居', '化妆品'],
    work_orders: [
        { orderId: 'order_1', orderName: '夏季T恤新品主图', clientId: 'client_1', leadId: 'user_art_li', status: 'in_progress', type: 'non_shooting', needRendering: false, createdAt: getPastDate(1), createdBy: 'user_sales_wang', progress: 75, contractAmount: 5000, isTrial: false, startDate: getPastDate(1).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '服装' },
        { orderId: 'order_2', orderName: '智能音箱渲染图', clientId: 'client_2', leadId: 'user_render_sun', status: 'in_progress', type: 'non_shooting', needRendering: true, createdAt: getPastDate(2), createdBy: 'user_sales_wang', progress: 40, contractAmount: 12000, isTrial: false, startDate: getPastDate(2).toISOString().split('T')[0], hasPhysicalObject: false, productCategory: '智能家居' },
        { orderId: 'order_3', orderName: '薯片包装拍摄', clientId: 'client_3', leadId: null, status: 'in_progress', type: 'shooting', needRendering: false, createdAt: getPastDate(3), createdBy: 'user_sales_wang', progress: 10, contractAmount: 800, isTrial: true, startDate: getPastDate(3).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '零食' },
        { orderId: 'order_4', orderName: '春季夹克详情页', clientId: 'client_1', leadId: 'user_art_li', status: 'completed', type: 'non_shooting', needRendering: false, createdAt: getPastDate(10), completedAt: getPastDate(7).toISOString().split('T')[0], createdBy: 'user_sales_wang', progress: 100, contractAmount: 4500, isTrial: false, startDate: getPastDate(10).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '服装', finalPaymentStatus: '已结算' },
        { orderId: 'order_5', orderName: '运动鞋海报设计', clientId: 'client_1', leadId: 'user_art_li', status: 'completed', type: 'non_shooting', needRendering: false, createdAt: getPastDate(5), completedAt: getPastDate(2).toISOString().split('T')[0], createdBy: 'user_sales_wang', progress: 100, contractAmount: 3000, isTrial: false, startDate: getPastDate(5).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '服装', finalPaymentStatus: '待结算' },
        { orderId: 'order_6', orderName: '新款手机渲染', clientId: 'client_2', leadId: 'user_render_sun', status: 'completed', type: 'non_shooting', needRendering: true, createdAt: getPastDate(8), completedAt: getPastDate(1).toISOString().split('T')[0], createdBy: 'user_sales_wang', progress: 100, contractAmount: 25000, isTrial: false, startDate: getPastDate(8).toISOString().split('T')[0], hasPhysicalObject: false, productCategory: '手机', finalPaymentStatus: '已结算' },
        { orderId: 'order_7', orderName: '电风扇拍摄', clientId: 'client_2', leadId: 'user_art_li', status: 'completed', type: 'shooting', needRendering: false, createdAt: getPastDate(12), completedAt: getPastDate(9).toISOString().split('T')[0], createdBy: 'user_sales_wang', progress: 100, contractAmount: 1500, isTrial: false, startDate: getPastDate(12).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '电风扇', finalPaymentStatus: '待结算' }
    ],
    tasks: [
        { taskId: 'task_1', orderId: 'order_1', assigneeId: 'user_art_zhang', assignerId: 'user_art_li', departmentId: 'dept_art', status: 'in_progress', description: '制作3张白底主图' },
        { taskId: 'task_2', orderId: 'order_2', assigneeId: null, assignerId: 'user_render_sun', departmentId: 'dept_render', status: 'pending', description: '高质量渲染智能音箱白色款' },
        { taskId: 'task_3', orderId: 'order_3', assigneeId: null, assignerId: null, departmentId: 'dept_art', status: 'pending', description: '分配拍摄后的图片精修任务' },
        { taskId: 'task_4', orderId: 'order_4', assigneeId: 'user_art_zhang', assignerId: 'user_art_li', status: 'completed', description: '完成夹克详情页切图' },
        { taskId: 'task_5', orderId: 'order_5', assigneeId: 'user_art_zhang', assignerId: 'user_art_li', status: 'completed', description: '设计运动鞋海报初稿' },
         { taskId: 'task_6', orderId: 'order_6', assigneeId: 'user_render_sun', assignerId: 'user_render_sun', status: 'completed', description: '渲染新款手机' },
         { taskId: 'task_7', orderId: 'order_7', assigneeId: 'user_art_zhang', assignerId: 'user_art_li', status: 'completed', description: '电风扇精修' },
    ],
    performance_logs: [
        { logId: 'log_1', taskId: 'task_4', employeeId: 'user_art_zhang', workHours: 8, imageCount: 10, detailCount: 1, logDate: getPastDate(7).toISOString().split('T')[0] },
        { logId: 'log_2', taskId: 'task_5', employeeId: 'user_art_zhang', workHours: 6, imageCount: 5, detailCount: 0, logDate: getPastDate(3).toISOString().split('T')[0] },
        { logId: 'log_3', taskId: 'task_5', employeeId: 'user_art_zhang', workHours: 4, imageCount: 3, detailCount: 0, logDate: getPastDate(2).toISOString().split('T')[0] },
        { logId: 'log_4', taskId: 'task_6', employeeId: 'user_render_sun', workHours: 8, imageCount: 8, detailCount: 0, logDate: getPastDate(1).toISOString().split('T')[0] },
        { logId: 'log_5', taskId: 'task_7', employeeId: 'user_art_zhang', workHours: 5, imageCount: 12, detailCount: 0, logDate: getPastDate(9).toISOString().split('T')[0] },
    ],
    daily_reports: [
        { reportId: 'report_1', employeeId: 'user_art_zhang', reportDate: getPastDate(1).toISOString().split('T')[0], content: '完成了运动鞋海报的最终修改，并与组长确认。今天开始跟进夏季T恤项目。'},
    ]
};

// --- 应用程序状态管理 ---
const AppState = {
    currentUser: null,
    currentPage: 'dashboard',
    ...MOCK_DATA,
    trendChartInstance: null,
    categoryChartInstance: null,
    teamChartInstance: null,
    teamChartState: { view: 'departments', departmentId: null },
};

// --- 辅助函数 ---
const Helpers = {
    getAvatar(user) {
        if (!user) return '';
        const colors = ['#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bfdbfe', '#e9d5ff'];
        const textColors = ['#991b1b', '#9a3412', '#854d0e', '#3f6212', '#1e40af', '#581c87'];
        const hash = user.userId.charCodeAt(2) % colors.length;
        return `
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style="background-color:${colors[hash]}; color: ${textColors[hash]}" title="${user.name}">
                ${user.initials}
            </div>
        `;
    },
    getAlertLevel(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const hoursDiff = (now - created) / (1000 * 60 * 60);
        if (hoursDiff > 2.5 * 24) return { level: 'red', text: '红色预警' };
        if (hoursDiff > 1.5 * 24) return { level: 'yellow', text: '黄色预警' };
        return { level: 'green', text: '正常' };
    },
    renderInfoRow(label, value) {
        return `
            <div class="grid grid-cols-3 gap-4 py-2">
                <dt class="text-sm font-medium text-slate-500">${label}</dt>
                <dd class="text-sm text-slate-900 col-span-2">${value || '-'}</dd>
            </div>
        `;
    },
    renderEditableRow(label, inputHtml) {
        return `
            <div class="grid grid-cols-3 gap-4 items-center py-2">
                <label class="text-sm font-medium text-slate-500">${label}</label>
                <div class="col-span-2">${inputHtml}</div>
            </div>
        `;
    }
}

// --- Gemini API 模块 (JS 功能已禁用) ---
const Gemini = {
     async call(prompt) {
        // This function is kept for code reference but will not be called.
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed with status ${response.status}`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]) {
                return result.candidates[0].content.parts[0].text;
            }
            return "无法获取AI建议，请稍后重试。";
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "调用AI服务时出错。";
        }
    },
    async optimizeDailyReport(text) {
        // Functionality disabled as per request.
        return text;
    },
    async generateAnalysisSummary(data, isManager) {
        // Functionality disabled as per request.
        return "AI 分析功能当前已禁用。";
    }
}

// --- UI渲染模块 ---
const UI = {
    renderPage() {
        const { currentUser, currentPage } = AppState;
        if (!currentUser) return;
        
        this.renderSidebarNav(currentUser.role);
        const pageTitleEl = document.getElementById('page-title');
        const headerActionsEl = document.getElementById('header-actions');
        const appContentEl = document.getElementById('app');
        headerActionsEl.innerHTML = '';
        if (AppState.salesChartInstance) {
            AppState.salesChartInstance.destroy();
            AppState.salesChartInstance = null;
        }
        
        switch(currentPage) {
            case 'supervisor_dashboard':
            case 'team_view':
                pageTitleEl.textContent = '团队看板';
                this.renderTeamViewDashboard(appContentEl);
                break;
            case 'sales_dashboard':
                pageTitleEl.textContent = '我的看板';
                 headerActionsEl.innerHTML = `<button id="new-order-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"><i data-lucide="plus" class="w-4 h-4"></i>新建工单</button>`;
                this.renderSalesDashboard(appContentEl);
                break;
            case 'client_follow_ups':
                pageTitleEl.textContent = '客户跟踪记录';
                this.renderClientFollowUps(appContentEl);
                break;
            case 'dashboard':
                pageTitleEl.textContent = '工单看板';
                this.renderDashboard(appContentEl);
                break;
            case 'my_tasks':
                pageTitleEl.textContent = '我的任务';
                this.renderMyTasks(appContentEl);
                break;
            case 'team_members':
                pageTitleEl.textContent = '团队成员';
                this.renderTeamMembers(appContentEl);
                break;
            case 'daily_report':
                pageTitleEl.textContent = '写日报';
                 headerActionsEl.innerHTML = ``;
                this.renderDailyReport(appContentEl);
                break;
            case 'employee_management':
                pageTitleEl.textContent = '员工管理';
                this.renderEmployeeManagement(appContentEl);
                break;
            case 'personnel_file':
                pageTitleEl.textContent = '人事档案管理';
                this.renderPersonnelFileManagement(appContentEl);
                break;
            case 'department_management':
                pageTitleEl.textContent = '部门管理';
                this.renderDepartmentManagement(appContentEl);
                break;
            case 'position_management':
                pageTitleEl.textContent = '职位管理';
                this.renderPositionManagement(appContentEl);
                break;
            case 'analysis':
                const isManager = ['prod_manager', 'art_lead'].includes(currentUser.role);
                pageTitleEl.textContent = isManager ? '团队数据分析' : '我的数据分析';
                this.renderAnalysis(appContentEl);
                break;
        }
        lucide.createIcons();
    },
    
    renderSidebarNav(role) {
        const navEl = document.getElementById('sidebar-nav');
        let roleSpecificLinks = '';

        const baseLinks = `
            <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="dashboard">
                <i data-lucide="layout-dashboard" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">工单看板</span>
            </a>
            <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="my_tasks">
                <i data-lucide="check-square" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">我的任务</span>
            </a>
            <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="daily_report">
                <i data-lucide="pen-square" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">写日报</span>
            </a>
        `;

        if (role === 'hr') {
            roleSpecificLinks = `
                <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="employee_management">
                    <i data-lucide="users" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">员工管理</span>
                </a>
                <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="personnel_file">
                    <i data-lucide="contact-2" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">人事档案</span>
                </a>
                 <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="department_management">
                    <i data-lucide="building-2" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">部门管理</span>
                </a>
                <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="position_management">
                    <i data-lucide="briefcase" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">职位管理</span>
                </a>
            `;
        } else if (role === 'sales') {
            roleSpecificLinks = `
                <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="sales_dashboard">
                    <i data-lucide="bar-chart-3" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">我的看板</span>
                </a>
                <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="client_follow_ups">
                    <i data-lucide="book-user" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">客户跟踪记录</span>
                </a>
            `;
        } else if (role === 'kanban_supervisor') {
            roleSpecificLinks = `
                <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="supervisor_dashboard">
                    <i data-lucide="layout-grid" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">团队看板</span>
                </a>
            `;
        } else if (role.endsWith('_lead')) {
            roleSpecificLinks = `
                 <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="team_view">
                    <i data-lucide="users" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">团队看板</span>
                </a>
                <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="team_members">
                    <i data-lucide="contact" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">团队成员</span>
                </a>
            `;
        }

        navEl.innerHTML = baseLinks + roleSpecificLinks;
        
        // Highlight active link
        const currentPage = AppState.currentPage;
        const activeLink = navEl.querySelector(`[data-page="${currentPage}"]`);
        if (activeLink) {
            activeLink.classList.add('bg-slate-100');
        }
    },

    renderSalesDashboard(container) {
        const salesId = AppState.currentUser.userId;
        const myOrders = AppState.work_orders.filter(o => o.createdBy === salesId);
        
        const totalAmount = myOrders.reduce((sum, order) => sum + order.contractAmount, 0);
        const pendingPaymentOrders = myOrders.filter(o => o.status === 'completed' && o.finalPaymentStatus === '待结算').length;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
                    <div class="p-3 bg-indigo-100 rounded-lg"><i data-lucide="dollar-sign" class="w-7 h-7 text-indigo-600"></i></div>
                    <div><p class="text-sm text-slate-500">总销售额</p><p class="text-3xl font-bold text-slate-800">¥${totalAmount.toLocaleString()}</p></div>
                </div>
                <div class="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
                    <div class="p-3 bg-blue-100 rounded-lg"><i data-lucide="package" class="w-7 h-7 text-blue-600"></i></div>
                    <div><p class="text-sm text-slate-500">总订单数</p><p class="text-3xl font-bold text-slate-800">${myOrders.length}</p></div>
                </div>
                <div class="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
                     <div class="p-3 bg-yellow-100 rounded-lg"><i data-lucide="receipt" class="w-7 h-7 text-yellow-600"></i></div>
                    <div><p class="text-sm text-slate-500">待结算订单</p><p class="text-3xl font-bold text-yellow-500">${pendingPaymentOrders}</p></div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                <h3 class="p-4 text-lg font-semibold text-slate-800 border-b">订单尾款跟踪</h3>
                <table class="w-full text-left">
                   <thead class="bg-slate-50">
                       <tr>
                           <th class="p-4 text-sm font-semibold text-slate-600">工单名称</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">客户</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">合同金额</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">完成日期</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">尾款状态</th>
                       </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-200">
                   ${myOrders.filter(o => o.status === 'completed').map(order => {
                       const client = AppState.clients[order.clientId];
                       const paymentStatus = order.finalPaymentStatus;
                       let statusBadge = '';
                        if (paymentStatus === '已结算') {
                            statusBadge = 'status-badge-green';
                        } else if (paymentStatus === '待结算') {
                            statusBadge = 'status-badge-yellow';
                        } else {
                            statusBadge = 'status-badge-gray';
                        }
                       return `
                        <tr class="hover:bg-slate-50">
                           <td class="p-4 font-medium text-slate-800">${order.orderName}</td>
                           <td class="p-4 text-slate-600"><a href="#" class="text-indigo-600 hover:underline view-client-details" data-client-id="${client.clientId}">${client.name}</a></td>
                           <td class="p-4 text-slate-600">¥${order.contractAmount.toLocaleString()}</td>
                           <td class="p-4 text-slate-600">${new Date(order.completedAt).toLocaleDateString()}</td>
                           <td class="p-4"><span class="status-badge ${statusBadge}">${paymentStatus}</span></td>
                       </tr>
                       `
                   }).join('') || `<tr><td colspan="5" class="p-4 text-center text-slate-500">暂无已完成的订单</td></tr>`}
                   </tbody>
                </table>
             </div>
        `;
        lucide.createIcons();
    },

    renderDashboard(container) {
        const currentUser = AppState.currentUser;

        if (!currentUser) {
            container.innerHTML = '<p>Error: No user selected.</p>';
            return;
        }

        const isProdManager = currentUser.role === 'prod_manager';
        const isArtLead = currentUser.role === 'art_lead';
        const canHaveUnassignedColumn = isProdManager || isArtLead;

        let unassignedOrders = [];
        let inProgressOrders = [];
        let completedOrders = [];

        if (isProdManager) {
            unassignedOrders = AppState.work_orders.filter(o => o.status === 'in_progress' && !o.leadId);
            inProgressOrders = AppState.work_orders.filter(o => o.status === 'in_progress' && o.leadId);
            completedOrders = AppState.work_orders.filter(o => o.status === 'completed');
        } else if (isArtLead) {
            const myLeadOrders = AppState.work_orders.filter(o => o.leadId === currentUser.userId);
            
            unassignedOrders = myLeadOrders.filter(order => {
                const orderTasks = AppState.tasks.filter(t => t.orderId === order.orderId);
                return order.status === 'in_progress' && orderTasks.length > 0 && orderTasks.some(t => !t.assigneeId);
            });
            
            inProgressOrders = myLeadOrders.filter(order => {
                const orderTasks = AppState.tasks.filter(t => t.orderId === order.orderId);
                return order.status === 'in_progress' && (orderTasks.length === 0 || orderTasks.every(t => !!t.assigneeId));
            });
            
            completedOrders = myLeadOrders.filter(o => o.status === 'completed');
        } else {
            inProgressOrders = AppState.work_orders.filter(o => o.status === 'in_progress');
            completedOrders = AppState.work_orders.filter(o => o.status === 'completed');
        }
        
        const allInProgressForStats = AppState.work_orders.filter(o => o.status === 'in_progress');
        const yellowAlerts = allInProgressForStats.filter(o => Helpers.getAlertLevel(o.createdAt).level === 'yellow').length;
        const redAlerts = allInProgressForStats.filter(o => Helpers.getAlertLevel(o.createdAt).level === 'red').length;

        const unassignedColumnHtml = canHaveUnassignedColumn ? `
            <div class="bg-white/50 rounded-xl flex flex-col border">
                <h3 class="font-bold text-slate-800 p-4 border-b">待指派 (${unassignedOrders.length})</h3>
                <div class="p-4 space-y-4 overflow-y-auto flex-1">
                    ${unassignedOrders.map(order => this.renderOrderCard(order)).join('') || '<p class="text-slate-500 text-sm p-2">暂无工单</p>'}
                </div>
            </div>
        ` : '';

        const gridColsClass = canHaveUnassignedColumn ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-white p-5 rounded-xl shadow-sm border"><p class="text-sm text-slate-500">进行中工单</p><p class="text-3xl font-bold text-slate-800">${allInProgressForStats.length}</p></div>
                <div class="bg-white p-5 rounded-xl shadow-sm border"><p class="text-sm text-slate-500">已完成工单</p><p class="text-3xl font-bold text-slate-800">${AppState.work_orders.filter(o => o.status === 'completed').length}</p></div>
                <div class="bg-white p-5 rounded-xl shadow-sm border"><p class="text-sm text-slate-500">黄色预警</p><p class="text-3xl font-bold text-yellow-500">${yellowAlerts}</p></div>
                <div class="bg-white p-5 rounded-xl shadow-sm border"><p class="text-sm text-slate-500">红色预警</p><p class="text-3xl font-bold text-red-500">${redAlerts}</p></div>
            </div>
            <div class="grid ${gridColsClass} gap-6 flex-1">
                ${unassignedColumnHtml}
                <div class="bg-white/50 rounded-xl flex flex-col border">
                    <h3 class="font-bold text-slate-800 p-4 border-b">进行中 (${inProgressOrders.length})</h3>
                    <div class="p-4 space-y-4 overflow-y-auto flex-1">
                        ${inProgressOrders.map(order => this.renderOrderCard(order)).join('') || '<p class="text-slate-500 text-sm p-2">暂无工单</p>'}
                    </div>
                </div>
                <div class="bg-white/50 rounded-xl flex flex-col border">
                    <h3 class="font-bold text-slate-800 p-4 border-b">已完成 (${completedOrders.length})</h3>
                    <div class="p-4 space-y-4 overflow-y-auto flex-1">
                        ${completedOrders.map(order => this.renderOrderCard(order)).join('') || '<p class="text-slate-500 text-sm p-2">暂无工单</p>'}
                    </div>
                </div>
            </div>
        `;
    },
    renderOrderCard(order) {
        const client = AppState.clients[order.clientId]?.name || '未知客户';
        const { level, text } = order.status === 'completed' ? { level: 'gray', text: '已完成' } : Helpers.getAlertLevel(order.createdAt);
        const tasks = AppState.tasks.filter(t => t.orderId === order.orderId);
        const assignees = tasks.map(t => AppState.users[t.assigneeId]).filter(Boolean);

        return `
            <div class="bg-white rounded-xl p-4 shadow-md border border-slate-200/80 cursor-pointer hover:border-indigo-500 transition-all duration-300" data-order-id="${order.orderId}">
                <div class="flex justify-between items-start mb-3">
                     <h4 class="font-bold text-slate-800 pr-2">${order.orderName}</h4>
                     <span class="status-badge status-badge-${level}">${text}</span>
                </div>
                <p class="text-sm text-slate-600 mb-4 flex items-center gap-2">
                    <i data-lucide="tag" class="w-4 h-4 text-slate-400"></i> ${order.productCategory || '未分类'}
                </p>
                <div class="mb-3">
                   <div class="flex justify-between text-xs text-slate-500 mb-1">
                       <span>进度</span>
                       <span>${order.progress}%</span>
                   </div>
                   <div class="w-full bg-slate-200 rounded-full h-1.5">
                       <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${order.progress}%"></div>
                   </div>
                </div>
                <div class="text-sm text-slate-400 flex items-center justify-between mt-4 pt-3 border-t">
                    <div class="flex items-center -space-x-2">
                        ${assignees.length > 0 ? assignees.map(u => Helpers.getAvatar(u)).join('') : (order.leadId ? Helpers.getAvatar(AppState.users[order.leadId]) : '<span class="text-xs ml-2">未分配</span>')}
                    </div>
                    <span class="text-xs">客户: ${client}</span>
                </div>
            </div>
        `;
    },
     renderMyTasks(container) {
         const myTasks = AppState.tasks.filter(t => t.assigneeId === AppState.currentUser.userId);
         if (myTasks.length === 0) {
             container.innerHTML = `<div class="bg-white p-8 rounded-lg shadow-sm text-center text-slate-600">您当前没有待办任务。</div>`;
             return;
         }
         container.innerHTML = `
             <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table class="w-full text-left">
                   <thead class="bg-slate-50">
                       <tr>
                           <th class="p-4 text-sm font-semibold text-slate-600">工单名称</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">任务状态</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">工单进度</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">操作</th>
                       </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-200">
                   ${myTasks.map(task => {
                       const order = AppState.work_orders.find(o => o.orderId === task.orderId);
                       return `
                        <tr class="hover:bg-slate-50">
                           <td class="p-4 font-medium text-slate-800">${order.orderName}</td>
                           <td class="p-4">
                                <select class="task-status-select bg-slate-100 border-transparent rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" data-task-id="${task.taskId}">
                                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                                </select>
                           </td>
                           <td class="p-4 text-slate-600">${order.progress}%</td>
                           <td class="p-4 flex items-center gap-4">
                               <button class="text-indigo-600 hover:text-indigo-800 font-semibold text-sm update-progress-btn" data-task-id="${task.taskId}">更新进度</button>
                               <button class="text-slate-500 hover:text-slate-700 font-semibold text-sm log-work-btn" data-task-id="${task.taskId}">记录工时</button>
                           </td>
                       </tr>
                       `
                   }).join('')}
                   </tbody>
                </table>
             </div>
         `;
    },
    renderProgressModal(taskId) {
        const task = AppState.tasks.find(t => t.taskId === taskId);
        const order = AppState.work_orders.find(o => o.orderId === task.orderId);
        const content = `
            <form id="progress-update-form" data-order-id="${order.orderId}">
                <label for="progress-slider" class="block text-sm font-medium text-slate-700 mb-2">更新工单 "${order.orderName}" 的进度</label>
                <div class="flex items-center gap-4">
                    <input id="progress-slider" type="range" min="0" max="100" value="${order.progress}" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer">
                    <span id="progress-value" class="font-bold text-indigo-600 w-12 text-center">${order.progress}%</span>
                </div>
                <div class="mt-8 flex justify-end">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">确认更新</button>
                </div>
            </form>
        `;
        this.showModal('更新工单进度', content, 'max-w-md');
        document.getElementById('progress-slider').addEventListener('input', (e) => {
            document.getElementById('progress-value').textContent = `${e.target.value}%`;
        });
    },

    renderDailyReport(container) {
        const myReports = AppState.daily_reports.filter(r => r.employeeId === AppState.currentUser.userId);
        const noteColors = ["bg-amber-200", "bg-rose-200", "bg-violet-200", "bg-cyan-200", "bg-lime-200"];

        container.innerHTML = `
        <div class="flex h-full overflow-hidden text-gray-800">
            <aside class="hidden md:flex flex-col items-center w-24 bg-white/80 backdrop-blur-sm p-6 space-y-8 rounded-l-3xl shadow-sm">
                <div class="text-xl font-bold text-gray-800">Docket</div>
                
                <button id="add-button-notes" class="flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                
                <div id="color-palette" class="flex flex-col space-y-3 pt-4">
                    <span class="color-dot bg-amber-300" data-color="bg-amber-200"></span>
                    <span class="color-dot bg-rose-300" data-color="bg-rose-200"></span>
                    <span class="color-dot bg-violet-300" data-color="bg-violet-200"></span>
                    <span class="color-dot bg-cyan-300" data-color="bg-cyan-200"></span>
                    <span class="color-dot bg-lime-300" data-color="bg-lime-200"></span>
                </div>
            </aside>

            <main class="flex-1 flex flex-col overflow-hidden">
                <header class="flex-shrink-0 px-6 sm:px-10 py-8">
                    <div class="flex items-center w-full max-w-md text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="search" placeholder="搜索日报..." class="w-full bg-transparent focus:outline-none text-lg">
                    </div>
                </header>

                <div class="flex-1 overflow-y-auto p-6 sm:p-10 pt-0 no-scrollbar">
                    <h1 class="text-5xl font-bold mb-8">我的日报</h1>
                    <div id="notes-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        ${myReports.slice().reverse().map((r, index) => {
                            const colorClass = noteColors[index % noteColors.length];
                            return `
                            <div class="note-card relative flex flex-col justify-between p-6 rounded-2xl shadow-sm ${colorClass}">
                                <p class="text-lg font-medium text-gray-800/90" contenteditable="false">${r.content}</p>
                                <footer class="flex justify-between items-center mt-4">
                                    <span class="text-sm text-gray-600/80">${new Date(r.reportDate).toLocaleDateString()}</span>
                                </footer>
                            </div>
                            `
                        }).join('')}
                    </div>
                </div>
            </main>
        </div>
        `;
        this.initNotesFunctionality();
    },

    initNotesFunctionality() {
        const addButton = document.getElementById('add-button-notes');
        if (!addButton) return; 

        const colorPalette = document.getElementById('color-palette');
        const colorDots = document.querySelectorAll('.color-dot');
        const notesGrid = document.getElementById('notes-grid');
        
        let isPaletteVisible = false;

        if(colorPalette) colorPalette.style.display = 'none';

        addButton.addEventListener('click', () => {
            addButton.classList.add('clicked');
            setTimeout(() => {
                addButton.classList.remove('clicked');
            }, 300);

            isPaletteVisible = !isPaletteVisible;

            if (isPaletteVisible) {
                colorPalette.style.display = 'flex';
                setTimeout(() => {
                    colorDots.forEach((dot, index) => {
                        setTimeout(() => {
                            dot.classList.add('show');
                        }, index * 50);
                    });
                }, 10);
            } else {
                [...colorDots].reverse().forEach((dot, index) => {
                     setTimeout(() => {
                        dot.classList.remove('show');
                    }, index * 50);
                });
                setTimeout(() => {
                    if(colorPalette) colorPalette.style.display = 'none';
                }, 400);
            }
        });

        colorDots.forEach(dot => {
            dot.addEventListener('click', function() {
                const colorClass = this.dataset.color;

                const dotRect = this.getBoundingClientRect();
                const gridRect = notesGrid.getBoundingClientRect();
                const gridStyle = getComputedStyle(notesGrid);
                
                const endX = gridRect.left + parseFloat(gridStyle.paddingLeft || 0);
                const endY = gridRect.top + parseFloat(gridStyle.paddingTop || 0);

                const startX = dotRect.left + dotRect.width / 2 - endX;
                const startY = dotRect.top + dotRect.height / 2 - endY;

                const existingNotes = notesGrid.querySelectorAll('.note-card');
                existingNotes.forEach(note => {
                    note.classList.add('shake-effect');
                    note.addEventListener('animationend', () => {
                        note.classList.remove('shake-effect');
                    }, { once: true });
                });

                const newNote = document.createElement('div');
                newNote.className = `note-card relative flex flex-col justify-between p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 ${colorClass} new-note-animation`;
                
                newNote.style.setProperty('--start-x', `${startX}px`);
                newNote.style.setProperty('--start-y', `${startY}px`);
                
                newNote.innerHTML = `
                    <p class="text-lg font-medium text-gray-800/90" contenteditable="true">新的日报...</p>
                    <footer class="flex justify-between items-center mt-4">
                        <span class="text-sm text-gray-600/80">${new Date().toLocaleDateString()}</span>
                        <button class="submit-report-btn flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                        </button>
                    </footer>
                `;

                notesGrid.prepend(newNote);
                
                newNote.addEventListener('animationend', () => {
                    newNote.classList.remove('new-note-animation');
                }, { once: true });
                
                const submitButton = newNote.querySelector('.submit-report-btn');
                const noteContent = newNote.querySelector('p');

                const handleSubmit = () => {
                    const content = noteContent.textContent;
                    App.submitDailyReport(content).then(() => {
                        noteContent.contentEditable = false;
                        submitButton.outerHTML = '<span class="text-sm text-green-500">已提交</span>';
                    });
                };
                
                submitButton.addEventListener('click', handleSubmit);
            });
        });
    },

    renderDailyReportModal() {
        // This function is now obsolete.
    },
    
    renderAnalysis(container) {
        const isManager = ['prod_manager', 'art_lead'].includes(AppState.currentUser.role);
        const trendChartTitle = isManager ? '团队产出趋势分析' : '我的产出趋势分析';
        const categoryChartTitle = isManager ? '已完成项目类别分布' : '我完成的项目类别分布';

        container.innerHTML = `
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div class="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-slate-800">${trendChartTitle}</h3>
                        <select id="analysis-period" class="bg-slate-100 border-transparent rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="7">过去7天</option>
                            <option value="14">过去14天</option>
                            <option value="30">过去30天</option>
                        </select>
                    </div>
                    <div class="h-80"><canvas id="trend-chart"></canvas></div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4">${categoryChartTitle}</h3>
                    <div class="h-80"><canvas id="category-chart"></canvas></div>
                </div>
            </div>
        `;
        this.updateAnalysisCharts(7);
    },

    updateAnalysisCharts(days) {
        if (AppState.trendChartInstance) AppState.trendChartInstance.destroy();
        if (AppState.categoryChartInstance) AppState.categoryChartInstance.destroy();

        const trendChartEl = document.getElementById('trend-chart');
        const categoryChartEl = document.getElementById('category-chart');
        if (!trendChartEl || !categoryChartEl) return;
        
        const trendCtx = trendChartEl.getContext('2d');
        const categoryCtx = categoryChartEl.getContext('2d');
        const analysisData = App.getAnalysisData(days);
        
        const trendChartType = 'line';

        const trendDatasets = [
            {
                label: '已完成工单',
                data: analysisData.trend.completedOrders,
                borderColor: 'rgba(99, 102, 241, 1)',
                tension: 0.2,
                fill: false
            },
            {
                label: '完成详情页',
                data: analysisData.trend.detailPages,
                borderColor: 'rgba(52, 211, 153, 1)',
                tension: 0.2,
                fill: false
            },
            {
                label: '完成图片数',
                data: analysisData.trend.imageCounts,
                borderColor: 'rgba(251, 146, 60, 1)',
                tension: 0.2,
                fill: false
            }
        ];

        AppState.trendChartInstance = new Chart(trendCtx, {
            type: trendChartType,
            data: {
                labels: analysisData.trend.labels,
                datasets: trendDatasets
            },
            options: { scales: { y: { beginAtZero: true, suggestedMax: 10 } }, responsive: true, maintainAspectRatio: false }
        });

        AppState.categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: analysisData.category.labels,
                datasets: [{
                    label: '项目数',
                    data: analysisData.category.data,
                    backgroundColor: ['#818cf8', '#fbbf24', '#4ade80', '#60a5fa', '#f87171', '#c084fc'],
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
        });
    },
    
    showLoadingState(button) {
        button.disabled = true;
        const buttonText = button.querySelector('.btn-text');
        if (buttonText) buttonText.textContent = '思考中...';
        const icon = button.querySelector('i');
        if (icon) icon.classList.add('ai-thinking');
    },

    hideLoadingState(button, originalText) {
        button.disabled = false;
        const buttonText = button.querySelector('.btn-text');
        if (buttonText) buttonText.textContent = originalText;
        const icon = button.querySelector('i');
        if (icon) icon.classList.remove('ai-thinking');
    },

    showModal(title, content, size = 'max-w-3xl') { 
        const modal = document.getElementById('modal');
        const modalContentEl = document.getElementById('modal-content');
        modalContentEl.className = `modal-content ${size}`;
        modalContentEl.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-slate-800">${title}</h3>
                <button id="modal-close" class="p-1.5 rounded-full text-slate-500 hover:bg-slate-100">&times;</button>
            </div>
            <div>${content}</div>
        `;
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('open'), 10);
        document.getElementById('modal-close').onclick = () => this.hideModal();
    },
    hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('open');
        setTimeout(() => modal.classList.add('hidden'), 200);
    },
    renderNewOrderForm() {
        const clientOptions = Object.values(AppState.clients).map(c => `<option value="${c.clientId}">${c.name}</option>`).join('');
        const categoryOptions = AppState.product_categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

        const content = `
            <form id="new-order-form">
                <div class="space-y-8">
                    <!-- Section 1: Basic Info -->
                    <fieldset class="border-t border-slate-200 pt-6">
                        <legend class="text-lg font-semibold text-slate-800 px-2">基础信息</legend>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">工单/项目名称</label>
                                <input type="text" required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">客户</label>
                                <select required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">${clientOptions}</select>
                            </div>
                        </div>
                    </fieldset>
                    
                    <!-- Section 2: Financial & Time -->
                    <fieldset class="border-t border-slate-200 pt-6">
                        <legend class="text-lg font-semibold text-slate-800 px-2">财务与时间</legend>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                             <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">合同金额 (元)</label>
                                <input type="number" placeholder="0.00" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">计划开始时间</label>
                                <input type="date" required value="${new Date().toISOString().split('T')[0]}" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                        </div>
                    </fieldset>

                     <!-- Section 3: Project Details -->
                    <fieldset class="border-t border-slate-200 pt-6">
                        <legend class="text-lg font-semibold text-slate-800 px-2">项目详情</legend>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">产品类别</label>
                                <select required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">${categoryOptions}</select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">项目类型</label>
                                <div class="flex gap-4 mt-2">
                                    <label class="flex items-center gap-2"><input type="radio" name="isTrial" value="false" checked class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"> <span class="text-sm text-gray-700">正式</span></label>
                                    <label class="flex items-center gap-2"><input type="radio" name="isTrial" value="true" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"> <span class="text-sm text-gray-700">试单</span></label>
                                </div>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-slate-700">属性与要求</label>
                                <div class="flex gap-x-6 gap-y-2 flex-wrap mt-2">
                                    <label class="flex items-center gap-2"><input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"> <span class="text-sm text-gray-700">需要渲染</span></label>
                                    <label class="flex items-center gap-2"><input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"> <span class="text-sm text-gray-700">是拍摄单</span></label>
                                    <label class="flex items-center gap-2"><input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"> <span class="text-sm text-gray-700">有实物</span></label>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div class="mt-8 flex justify-end gap-3 border-t pt-6">
                    <button type="button" class="bg-slate-100 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-200" onclick="UI.hideModal()">取消</button>
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">确认创建工单</button>
                </div>
            </form>
        `;
        this.showModal('创建新工单', content);
    },
    renderOrderDetails(orderId) {
        const order = AppState.work_orders.find(o => o.orderId === orderId);
        const client = AppState.clients[order.clientId];
        const creator = AppState.users[order.createdBy];
        const tasks = AppState.tasks.filter(t => t.orderId === orderId);
        const currentUserRole = AppState.currentUser.role;
        
        let actionButton = '';
        if (currentUserRole === 'prod_manager' && !order.leadId) {
            const leads = Object.values(AppState.users).filter(u => u.role.endsWith('_lead'));
            const leadOptions = leads.map(l => `<option value="${l.userId}">${l.name}</option>`).join('');
            actionButton = `
                <div class="flex items-center gap-2">
                    <select id="assign-lead-select" class="bg-slate-100 border-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">选择组长...</option>
                        ${leadOptions}
                    </select>
                    <button data-order-id="${order.orderId}" class="assign-order-to-lead-btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg">指派</button>
                </div>
            `;
        }

        const tasksHtml = tasks.map(t => {
            const assignee = t.assigneeId ? AppState.users[t.assigneeId] : null;
            let taskActionButton = '';
            if(currentUserRole === 'art_lead' && !assignee) {
                taskActionButton = `<button class="assign-task-to-member-btn text-xs text-indigo-600 hover:underline" data-task-id="${t.taskId}">分配</button>`;
            }
            return `<li class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span class="text-slate-700">${t.description}</span>
                <div class="flex items-center gap-2">
                    ${assignee ? Helpers.getAvatar(assignee) : '<span class="text-xs text-slate-500">待分配</span>'}
                    ${taskActionButton}
                </div>
            </li>`;
        }).join('');

        const content = `
            <div class="space-y-5">
               <div class="grid grid-cols-2 gap-4 text-sm">
                   <p><strong>客户:</strong> <span class="text-slate-600">${client.name}</span></p>
                   <p><strong>创建人:</strong> <span class="text-slate-600">${creator.name}</span></p>
                   <p><strong>创建时间:</strong> <span class="text-slate-600">${new Date(order.createdAt).toLocaleString()}</span></p>
                   <p><strong>状态:</strong> <span class="text-slate-600">${order.status === 'completed' ? '已完成' : '进行中'}</span></p>
                   <p><strong>属性:</strong> <span class="text-slate-600">${order.needRendering ? '渲染' : '常规'} / ${order.type === 'shooting' ? '拍摄' : '非拍摄'}</span></p>
               </div>
                <hr class="my-4">
                <h4 class="font-bold text-lg">相关任务</h4>
                ${tasks.length > 0 ? `<ul class="space-y-2">${tasksHtml}</ul>` : '<p class="text-slate-500">暂无任务</p>'}
            </div>
            <div class="mt-8 flex justify-end">${actionButton}</div>
        `;
        this.showModal(`工单: ${order.orderName}`, content, 'max-w-2xl');
        lucide.createIcons();
    },
    renderAssignTaskModal(taskId) {
        const task = AppState.tasks.find(t => t.taskId === taskId);
        const lead = AppState.users[AppState.currentUser.userId];
        // Find members in the same department as the lead
        const members = Object.values(AppState.users).filter(u => u.departmentId === lead.departmentId && u.role.endsWith('_staff'));
        const memberOptions = members.map(m => `<option value="${m.userId}">${m.name}</option>`).join('');

        const content = `
            <form id="assign-task-form" data-task-id="${taskId}">
                 <p class="mb-4">将任务"${task.description}"分配给：</p>
                 <select id="assign-member-select" class="w-full mt-1 block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                   ${memberOptions}
                 </select>
                 <div class="mt-8 flex justify-end">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">确认分配</button>
                </div>
            </form>
        `;
        this.showModal('分配任务给组员', content, 'max-w-md');
    },
     renderClientDetailsModal(clientId) {
        const client = AppState.clients[clientId];
        const followUps = AppState.follow_ups.filter(f => f.clientId === clientId).sort((a, b) => new Date(b.followUpDate) - new Date(a.followUpDate));

        const content = `
            <div class="flex border-b border-slate-200">
                <button class="tab-btn active-tab py-3 px-4 text-sm font-semibold border-b-2 border-indigo-600 text-indigo-600" data-tab="details">客户详情</button>
                <button class="tab-btn py-3 px-4 text-sm font-semibold text-slate-500 border-b-2 border-transparent" data-tab="history">跟进历史</button>
            </div>
            <div class="mt-4">
                <!-- Details Tab Content -->
                <div id="details-tab-content" class="tab-content">
                    <div class="p-4 bg-slate-50 rounded-lg space-y-3">
                        <p><strong>联系人:</strong> ${client.contactName}</p>
                        <p><strong>联系电话:</strong> ${client.contactPhone}</p>
                        <p><strong>已付定金:</strong> ¥${client.depositPaid.toLocaleString()}</p>
                    </div>
                </div>
                <!-- History Tab Content -->
                <div id="history-tab-content" class="tab-content hidden">
                     <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold">跟进记录</h4>
                        <button id="add-follow-up-btn" data-client-id="${clientId}" class="text-sm text-indigo-600 font-semibold hover:underline">添加跟进</button>
                    </div>
                    <div class="space-y-2 max-h-60 overflow-y-auto p-1">
                        ${followUps.length > 0 ? followUps.map(f => `
                            <div class="p-3 bg-slate-100 rounded">
                                <p class="text-xs text-slate-500">${f.followUpDate} (${f.type === 'call' ? '电话' : '拜访'})</p>
                                <p class="text-sm text-slate-800">${f.notes}</p>
                            </div>
                        `).join('') : '<p class="text-sm text-slate-500 p-3">暂无跟进记录</p>'}
                    </div>
                </div>
            </div>
        `;
        this.showModal(`客户: ${client.name}`, content, 'max-w-lg');
        
        // Add event listeners for the new tabs
        const modalContent = document.getElementById('modal-content');
        modalContent.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                modalContent.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active-tab', 'text-indigo-600', 'border-indigo-600');
                    btn.classList.add('text-slate-500', 'border-transparent');
                });

                const clickedButton = e.currentTarget;
                clickedButton.classList.add('active-tab', 'text-indigo-600', 'border-indigo-600');
                clickedButton.classList.remove('text-slate-500', 'border-transparent');

                modalContent.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.add('hidden');
                });

                const tabId = clickedButton.dataset.tab + '-tab-content';
                document.getElementById(tabId).classList.remove('hidden');
            });
        });
        lucide.createIcons();
    },
    renderFollowUpModal(clientId) {
         const content = `
            <form id="add-follow-up-form" data-client-id="${clientId}">
                <div class="space-y-4">
                     <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">跟进类型</label>
                        <select id="follow-up-type" class="w-full mt-1 block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                           <option value="call">电话沟通</option>
                           <option value="visit">上门拜访</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">跟进内容</label>
                        <textarea id="follow-up-notes" required class="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300"></textarea>
                    </div>
                </div>
                 <div class="mt-8 flex justify-end">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">保存记录</button>
                </div>
            </form>
        `;
        this.showModal('添加跟进记录', content, 'max-w-md');
    },
    renderEditProfileModal() {
         const user = AppState.currentUser;
         const department = AppState.departments[user.departmentId].name;
         const supervisor = user.supervisorId ? AppState.users[user.supervisorId].name : '无';
         const roleDisplayNames = {
            'sales': '销售',
            'prod_manager': '生产主管',
            'art_lead': '美工组长',
            'art_staff': '美工',
            'render_staff': '渲染师',
            'kanban_supervisor': '看板总监',
            'hr': '人事'
         };
         const roleName = roleDisplayNames[user.role] || user.role;
         
         const content = `
            <form id="edit-profile-form">
                <div class="space-y-8">
                    <!-- Personal & Contact Info -->
                    <fieldset>
                        <legend class="text-lg font-semibold text-slate-800 pb-3 border-b">基本信息</legend>
                        <dl class="mt-4 divide-y divide-slate-100">
                            ${Helpers.renderInfoRow('姓名', user.name)}
                            ${Helpers.renderEditableRow('性别', `
                                <select class="w-full mt-1 block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2">
                                   <option value="男" ${user.gender === '男' ? 'selected' : ''}>男</option>
                                   <option value="女" ${user.gender === '女' ? 'selected' : ''}>女</option>
                                </select>
                            `)}
                            ${Helpers.renderEditableRow('出生日期', `<input type="date" class="w-full mt-1 block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2" value="${user.dob}">`)}
                            ${Helpers.renderEditableRow('个人邮箱', `<input type="email" required class="w-full mt-1 block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2" value="${user.email}">`)}
                        </dl>
                    </fieldset>

                    <!-- Employment Info -->
                    <fieldset>
                        <legend class="text-lg font-semibold text-slate-800 pb-3 border-b">任职信息</legend>
                        <dl class="mt-4 divide-y divide-slate-100">
                            ${Helpers.renderInfoRow('入职时间', user.hireDate)}
                            ${Helpers.renderInfoRow('部门', department)}
                            ${Helpers.renderInfoRow('岗位名称', roleName)}
                            ${Helpers.renderInfoRow('直接上级', supervisor)}
                            ${Helpers.renderInfoRow('是否试用期', user.onProbation ? '是' : '否')}
                        </dl>
                    </fieldset>

                    <!-- Password Change -->
                    <fieldset>
                        <legend class="text-lg font-semibold text-slate-800 pb-3 border-b">修改密码</legend>
                        <div class="space-y-4 mt-4">
                             <div class="grid grid-cols-3 gap-4 items-center">
                                <label class="text-sm font-medium text-slate-500">当前密码</label>
                                <div class="col-span-2">
                                    <input type="password" class="w-full mt-1 block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2" placeholder="留空则不修改">
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-4 items-center">
                                <label class="text-sm font-medium text-slate-500">新密码</label>
                                <div class="col-span-2">
                                    <input type="password" class="w-full mt-1 block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2">
                                </div>
                            </div>
                             <div class="grid grid-cols-3 gap-4 items-center">
                                <label class="text-sm font-medium text-slate-500">确认新密码</label>
                                <div class="col-span-2">
                                    <input type="password" class="w-full mt-1 block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2">
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
                 <div class="mt-8 flex justify-end gap-3 border-t pt-6">
                    <button type="button" class="bg-slate-100 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-200" onclick="UI.hideModal()">取消</button>
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">保存更改</button>
                </div>
            </form>
        `;
        this.showModal('个人中心', content, 'max-w-2xl');
    },
    renderTeamViewDashboard(container) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <div id="team-chart-header" class="flex justify-between items-center mb-4">
                    <h3 id="team-chart-title" class="text-lg font-semibold text-slate-800"></h3>
                    <button id="team-chart-back-btn" class="hidden bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1 px-3 rounded-lg text-sm">
                        &larr; 返回团队视图
                    </button>
                </div>
                <div class="h-96">
                    <canvas id="team-view-chart"></canvas>
                </div>
            </div>
        `;
        AppState.teamChartState = { view: 'departments', departmentId: null };
        this.renderTeamChart();
    },

    renderTeamChart() {
        if (AppState.teamChartInstance) {
            AppState.teamChartInstance.destroy();
        }

        const ctx = document.getElementById('team-view-chart')?.getContext('2d');
        if (!ctx) return;

        const chartTitle = document.getElementById('team-chart-title');
        const backBtn = document.getElementById('team-chart-back-btn');
        const { view, departmentId } = AppState.teamChartState;
        
        let chartData;
        let title;

        const deptsToView = AppState.currentUser.role === 'kanban_supervisor' 
            ? ['dept_art', 'dept_render'] 
            : [AppState.currentUser.departmentId];

        if (view === 'departments') {
            const departmentalData = App.getDepartmentalData(deptsToView, AppState.currentUser);
            chartData = {
                labels: deptsToView.map(id => departmentalData[id]?.name).filter(Boolean),
                values: deptsToView.map(id => departmentalData[id]?.inProgressCount),
                ids: deptsToView
            };
            title = '各团队进行中任务';
            backBtn.classList.add('hidden');
        } else { // view === 'members'
            const departmentalData = App.getDepartmentalData([departmentId], AppState.currentUser);
            const department = departmentalData[departmentId];
            
            chartData = {
                labels: department.members.map(m => m.name),
                values: department.members.map(m => m.inProgressCount),
                ids: department.members.map(m => m.userId)
            };
            title = `${department.name} - 成员进行中任务`;
            backBtn.classList.remove('hidden');
        }

        chartTitle.textContent = title;

        AppState.teamChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '进行中任务数',
                    data: chartData.values,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                onClick: (e, elements) => {
                    if (AppState.teamChartState.view !== 'departments' || elements.length === 0) {
                        return;
                    }
                    const clickedIndex = elements[0].index;
                    const clickedDeptId = chartData.ids[clickedIndex];
                    
                    AppState.teamChartState = { view: 'members', departmentId: clickedDeptId };
                    this.renderTeamChart();
                }
            }
        });
    },
    renderTeamMembers(container) {
        const lead = AppState.currentUser;
        const departmentData = App.getDepartmentalData([lead.departmentId], lead);
        const members = departmentData[lead.departmentId].members;

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table class="w-full text-left">
                   <thead class="bg-slate-50">
                       <tr>
                           <th class="p-4 text-sm font-semibold text-slate-600">成员</th>
                           <th class="p-4 text-sm font-semibold text-slate-600 text-center">进行中任务</th>
                           <th class="p-4 text-sm font-semibold text-slate-600 text-center">已完成任务</th>
                           <th class="p-4 text-sm font-semibold text-slate-600 text-center">平均工时 (h)</th>
                       </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-200">
                   ${members.map(member => `
                        <tr class="hover:bg-slate-50">
                           <td class="p-4 font-medium text-slate-800 flex items-center gap-3">
                                ${Helpers.getAvatar(member)}
                                <div>
                                    <p>${member.name}</p>
                                    <p class="text-xs text-slate-500 capitalize">${member.role.replace('_', ' ')}</p>
                                </div>
                           </td>
                           <td class="p-4 text-slate-600 text-center">${member.inProgressCount}</td>
                           <td class="p-4 text-slate-600 text-center">${member.completedCount}</td>
                           <td class="p-4 text-slate-600 text-center">${member.avgHours.toFixed(1)}</td>
                       </tr>
                   `).join('') || `<tr><td colspan="4" class="p-4 text-center text-slate-500">该部门下暂无成员</td></tr>`}
                   </tbody>
                </table>
             </div>
        `;
        lucide.createIcons();
    },
    renderClientFollowUps(container) {
        const followUps = AppState.follow_ups.sort((a, b) => new Date(b.followUpDate) - new Date(a.followUpDate));
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table class="w-full text-left">
                   <thead class="bg-slate-50">
                       <tr>
                           <th class="p-4 text-sm font-semibold text-slate-600">客户名称</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">跟进日期</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">跟进类型</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">跟进人</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">跟进内容</th>
                       </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-200">
                   ${followUps.map(followUp => {
                       const client = AppState.clients[followUp.clientId];
                       const sales = AppState.users[followUp.salesId];
                       return `
                        <tr class="hover:bg-slate-50">
                           <td class="p-4 font-medium text-slate-800">${client ? client.name : '未知客户'}</td>
                           <td class="p-4 text-slate-600">${followUp.followUpDate}</td>
                           <td class="p-4 text-slate-600">${followUp.type === 'call' ? '电话' : '拜访'}</td>
                           <td class="p-4 text-slate-600">${sales ? sales.name : '未知'}</td>
                           <td class="p-4 text-slate-600 text-sm max-w-xs truncate" title="${followUp.notes}">${followUp.notes}</td>
                       </tr>
                       `
                   }).join('') || `<tr><td colspan="5" class="p-4 text-center text-slate-500">暂无客户跟进记录</td></tr>`}
                   </tbody>
                </table>
             </div>
        `;
        lucide.createIcons();
    },
    renderEmployeeManagement(container) {
        const users = Object.values(AppState.users);
        container.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-slate-800">员工列表</h2>
                    <button id="add-employee-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4"></i>新建员工
                    </button>
                </div>
                <div class="bg-white rounded-xl shadow-sm border overflow-hidden mt-4">
                    <table class="w-full text-left">
                       <thead class="bg-slate-50">
                           <tr>
                               <th class="p-4 text-sm font-semibold text-slate-600">姓名</th>
                               <th class="p-4 text-sm font-semibold text-slate-600">邮箱</th>
                               <th class="p-4 text-sm font-semibold text-slate-600">部门</th>
                               <th class="p-4 text-sm font-semibold text-slate-600">职位</th>
                               <th class="p-4 text-sm font-semibold text-slate-600">操作</th>
                           </tr>
                       </thead>
                       <tbody class="divide-y divide-slate-200">
                       ${users.map(user => {
                           const department = AppState.departments[user.departmentId];
                           const roleDisplayNames = {
                               'sales': '销售', 'prod_manager': '生产主管', 'art_lead': '美工组长',
                               'art_staff': '美工', 'render_staff': '渲染师', 'kanban_supervisor': '看板总监', 'hr': '人事'
                           };
                           const roleName = roleDisplayNames[user.role] || user.role;
                           return `
                            <tr class="hover:bg-slate-50">
                               <td class="p-4 font-medium text-slate-800">${user.name}</td>
                               <td class="p-4 text-slate-600">${user.email}</td>
                               <td class="p-4 text-slate-600">${department ? department.name : 'N/A'}</td>
                               <td class="p-4 text-slate-600">${roleName}</td>
                               <td class="p-4">
                                   <button class="edit-employee-btn text-indigo-600 hover:text-indigo-800 font-semibold text-sm" data-user-id="${user.userId}">编辑</button>
                               </td>
                           </tr>
                           `
                       }).join('')}
                       </tbody>
                    </table>
                </div>
            </div>
        `;
        lucide.createIcons();
    },
    renderPersonnelFileManagement(container) {
        const departmentOptions = Object.values(AppState.departments).map(d => `<option value="${d.departmentId}">${d.name}</option>`).join('');
        
        const containerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h2 class="text-xl font-semibold text-slate-800">员工档案列表</h2>
                    <div class="flex items-center gap-4">
                        <div class="relative">
                             <select id="personnel-department-filter" class="form-select w-full sm:w-48">
                                <option value="">所有部门</option>
                                ${departmentOptions}
                            </select>
                        </div>
                        <div class="relative w-full sm:w-64">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                            <input type="text" id="personnel-search-input" placeholder="按姓名搜索员工..." class="form-input w-full pl-10">
                        </div>
                    </div>
                </div>
                <div id="personnel-list-container" class="mt-4">
                    <!-- Employee list will be rendered here -->
                </div>
            </div>
        `;
        container.innerHTML = containerHTML;
        lucide.createIcons();

        const allUsers = Object.values(AppState.users);
        this._renderPersonnelFileList(allUsers);

        const searchInput = document.getElementById('personnel-search-input');
        const departmentFilter = document.getElementById('personnel-department-filter');

        const applyFilters = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const departmentId = departmentFilter.value;

            let filteredUsers = allUsers;

            if (searchTerm) {
                filteredUsers = filteredUsers.filter(user => user.name.toLowerCase().includes(searchTerm));
            }

            if (departmentId) {
                filteredUsers = filteredUsers.filter(user => user.departmentId === departmentId);
            }

            this._renderPersonnelFileList(filteredUsers);
        };

        searchInput.addEventListener('input', applyFilters);
        departmentFilter.addEventListener('change', applyFilters);
    },

    _renderPersonnelFileList(users) {
        const container = document.getElementById('personnel-list-container');
        if (!container) return;
        if (users.length === 0) {
            container.innerHTML = `<p class="text-center text-slate-500 py-8">未找到相关员工。</p>`;
            return;
        }

        const tableHtml = `
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-slate-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">姓名</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">邮箱</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">职位</th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        ${users.map(user => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        ${Helpers.getAvatar(user)}
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-slate-900">${user.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${user.email}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${AppState.departments[user.departmentId].name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${user.role}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button data-user-id="${user.userId}" class="edit-personnel-btn text-indigo-600 hover:text-indigo-900">编辑档案</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.innerHTML = tableHtml;
        lucide.createIcons();
    },

    renderPersonnelFileModal(userId) {
        const user = AppState.users[userId];
        if (!user) {
            console.error('User not found for personnel file modal');
            return;
        }

        const departmentName = AppState.departments[user.departmentId]?.name || 'N/A';
        
        const content = `
            <form id="personnel-file-form" data-user-id="${userId}">
                <div class="space-y-4">
                    ${Helpers.renderInfoRow('姓名', user.name)}
                    ${Helpers.renderInfoRow('部门', departmentName)}
                    ${Helpers.renderInfoRow('职位', user.role)}
                    ${Helpers.renderInfoRow('入职日期', user.hireDate)}

                    <hr class="my-4">

                    ${Helpers.renderEditableRow('合同信息', `<textarea name="contractInfo" class="w-full h-24 p-2 border rounded-md">${user.contractInfo || ''}</textarea>`)}
                    ${Helpers.renderEditableRow('薪资记录', `<textarea name="salaryRecords" class="w-full h-24 p-2 border rounded-md">${user.salaryRecords || ''}</textarea>`)}
                    ${Helpers.renderEditableRow('绩效评估', `<textarea name="performanceReviews" class="w-full h-24 p-2 border rounded-md">${user.performanceReviews || ''}</textarea>`)}
                </div>
                <div class="mt-6 flex justify-end">
                    <button type="button" class="modal-close-btn px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">取消</button>
                    <button type="submit" class="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">保存</button>
                </div>
            </form>
        `;

        this.showModal(`编辑 ${user.name} 的人事档案`, content, 'max-w-4xl');
    },

    renderEmployeeModal(userId) {
        const isNew = userId === null;
        const user = isNew ? {} : AppState.users[userId];
        const title = isNew ? '新增员工' : `编辑员工 - ${user.name}`;

        const departmentOptions = Object.values(AppState.departments).map(d => `<option value="${d.departmentId}" ${user.departmentId === d.departmentId ? 'selected' : ''}>${d.name}</option>`).join('');
        
        const getPositionOptions = (departmentId, selectedPositionId) => {
            if (!departmentId) return '<option value="">请先选择部门</option>';
            return Object.values(AppState.positions)
                .filter(p => p.departmentId === departmentId)
                .map(p => `<option value="${p.positionId}" ${selectedPositionId === p.positionId ? 'selected' : ''}>${p.name}</option>`)
                .join('');
        };
        
        const getManagerOptions = (departmentId, selectedManagerId) => {
            if (!departmentId) return '<option value="">请先选择部门</option>';
            return Object.values(AppState.users)
                .filter(u => u.departmentId === departmentId && u.userId !== user.userId)
                .map(u => `<option value="${u.userId}" ${selectedManagerId === u.userId ? 'selected' : ''}>${u.name}</option>`)
                .join('');
        };
        
        const statusOptions = ['在职', '离职'].map(s => `<option value="${s}" ${user.status === s ? 'selected' : ''}>${s}</option>`).join('');
        const genderOptions = ['男', '女', '其他'].map(g => `<option value="${g}" ${user.gender === g ? 'selected' : ''}>${g}</option>`).join('');
        const maritalOptions = ['未婚', '已婚', '离异', '丧偶'].map(m => `<option value="${m}" ${user.marital_status === m ? 'selected' : ''}>${m}</option>`).join('');
        const roleLevelOptions = ['普通员工', '组长', '主管'].map(r => `<option value="${r}" ${user.roleLevel === r ? 'selected' : ''}>${r}</option>`).join('');

        const formRow = (label, inputHtml, required = false) => `
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                    ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
                </label>
                ${inputHtml}
            </div>
        `;

        const content = `
            <form id="employee-form" data-user-id="${userId || ''}">
                <div class="space-y-8">
                    <!-- Section 1: Basic Info -->
                    <fieldset class="border-t border-slate-200 pt-6">
                        <legend class="text-base font-semibold text-slate-900 leading-7 -mt-9 ml-4 px-2 bg-white w-fit">个人与联系信息</legend>
                        <div class="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-5 mt-4">
                            <div class="md:col-span-3">
                                ${formRow('姓名', `<input type="text" name="name" value="${user.name || ''}" class="form-input" required>`, true)}
                            </div>
                            <div class="md:col-span-3">
                                ${formRow('性别', `<select name="gender" class="form-select">${genderOptions}</select>`)}
                            </div>
                            <div class="md:col-span-3">
                                 ${formRow('出生日期', `<input type="date" name="birth_date" value="${user.birth_date || ''}" class="form-input">`)}
                            </div>
                            <div class="md:col-span-3">
                                 ${formRow('婚姻状况', `<select name="marital_status" class="form-select">${maritalOptions}</select>`)}
                            </div>
                            <div class="md:col-span-6">
                                ${formRow('身份证号', `<input type="text" name="id_number" value="${user.id_number || ''}" class="form-input">`)}
                            </div>
                             <div class="md:col-span-3">
                                ${formRow('联系电话', `<input type="tel" name="phone" value="${user.phone || ''}" class="form-input">`)}
                            </div>
                            <div class="md:col-span-3">
                                ${formRow('邮箱地址', `<input type="email" name="email" value="${user.email || ''}" class="form-input" required>`, true)}
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">家庭住址</label>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                                    <select name="province" id="province-select" class="form-select"></select>
                                    <select name="city" id="city-select" class="form-select"></select>
                                    <select name="district" id="district-select" class="form-select"></select>
                                </div>
                                <input type="text" name="street_address" value="${user.address?.street || ''}" class="form-input" placeholder="详细街道、楼牌号等">
                            </div>
                            <div class="md:col-span-3">
                                ${formRow('紧急联系人姓名', `<input type="text" name="emergency_contact_name" value="${user.emergency_contact?.name || ''}" class="form-input">`)}
                            </div>
                            <div class="md:col-span-3">
                                ${formRow('紧急联系人电话', `<input type="tel" name="emergency_contact_phone" value="${user.emergency_contact?.phone || ''}" class="form-input">`)}
                            </div>
                        </div>
                    </fieldset>
                    
                     <!-- Section 2: Employment Info -->
                    <fieldset class="border-t border-slate-200 pt-6">
                        <legend class="text-base font-semibold text-slate-900 leading-7 -mt-9 ml-4 px-2 bg-white w-fit">任职信息</legend>
                        <div class="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-5 mt-4">
                            <div class="md:col-span-3">
                                ${formRow('入职日期', `<input type="date" name="hire_date" value="${user.hire_date || ''}" class="form-input" required>`, true)}
                            </div>
                            <div class="md:col-span-3">
                                ${formRow('员工状态', `<select name="status" class="form-select" required>${statusOptions}</select>`, true)}
                            </div>
                            <div class="md:col-span-2">
                                ${formRow('部门', `<select name="departmentId" id="employee-department" class="form-select" required><option value="">选择部门</option>${departmentOptions}</select>`, true)}
                            </div>
                            <div class="md:col-span-2">
                                 ${formRow('职位', `<select name="positionId" id="employee-position" class="form-select" required>${getPositionOptions(user.departmentId, user.positionId)}</select>`, true)}
                            </div>
                            <div class="md:col-span-2">
                                ${formRow('角色等级', `<select name="roleLevel" class="form-select" required>${roleLevelOptions}</select>`, true)}
                            </div>
                            <div class="md:col-span-4">
                                 ${formRow('上级领导', `<select name="manager_id" id="employee-manager" class="form-select"><option value="">无</option>${getManagerOptions(user.departmentId, user.manager_id)}</select>`)}
                            </div>
                            <div class="md:col-span-2 flex items-end pb-2">
                                 <div class="flex items-center">
                                    <input type="checkbox" id="is_probation" name="is_probation" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" ${user.is_probation ? 'checked' : ''}>
                                    <label for="is_probation" class="ml-2 block text-sm font-medium text-slate-700">是否试用期</label>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    
                    <!-- Section 3: Education -->
                     <fieldset class="border-t border-slate-200 pt-6">
                        <legend class="text-base font-semibold text-slate-900 leading-7 -mt-9 ml-4 px-2 bg-white w-fit">教育背景</legend>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5 mt-4">
                            <div class="md:col-span-2">
                                 ${formRow('最高学历', `<input type="text" name="education" value="${user.education || ''}" class="form-input">`)}
                            </div>
                             <div class="md:col-span-2">
                                ${formRow('毕业院校', `<input type="text" name="university" value="${user.university || ''}" class="form-input">`)}
                            </div>
                            <div class="md:col-span-2">
                                 ${formRow('专业', `<input type="text" name="major" value="${user.major || ''}" class="form-input">`)}
                            </div>
                             <div class="md:col-span-2">
                                 ${formRow('毕业日期', `<input type="date" name="graduation_date" value="${user.graduation_date || ''}" class="form-input">`)}
                            </div>
                        </div>
                     </fieldset>

                    <!-- Section 4: Salary -->
                    <fieldset class="border-t border-slate-200 pt-6">
                        <legend class="text-base font-semibold text-slate-900 leading-7 -mt-9 ml-4 px-2 bg-white w-fit">薪资与绩效</legend>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5 mt-4">
                            <div class="md:col-span-2">
                                ${formRow('底薪 (元)', `<input type="number" step="0.01" name="base_salary" value="${user.base_salary || ''}" class="form-input" required>`, true)}
                            </div>
                            <div class="md:col-span-2">
                                ${formRow('绩效薪资 (元)', `<input type="number" step="0.01" name="performance_salary" value="${user.performance_salary || ''}" class="form-input">`)}
                            </div>
                            <div class="md:col-span-4">
                                 ${formRow('银行卡号', `<input type="text" name="bank_account" value="${user.bank_account || ''}" class="form-input">`)}
                            </div>
                            <div class="md:col-span-2">
                                ${formRow('工作绩效分 (%)', `<input type="number" min="0" max="100" name="work_performance_score" value="${user.work_performance_score || '0'}" class="form-input">`)}
                            </div>
                            <div class="md:col-span-2">
                                ${formRow('考勤绩效分 (%)', `<input type="number" min="0" max="100" name="attendance_performance_score" value="${user.attendance_performance_score || '0'}" class="form-input">`)}
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div class="mt-8 flex justify-end gap-3 border-t pt-6">
                    <button type="button" class="bg-white py-2 px-4 rounded-lg text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50" onclick="UI.hideModal()">取消</button>
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">${isNew ? '确认新增' : '保存更改'}</button>
                </div>
            </form>
        `;

        this.showModal(title, content, 'max-w-6xl');

        // --- Post-render logic for cascading selects ---

        const departmentSelect = document.getElementById('employee-department');
        const positionSelect = document.getElementById('employee-position');
        const managerSelect = document.getElementById('employee-manager');
        
        departmentSelect.addEventListener('change', (e) => {
            const selectedDepartmentId = e.target.value;
            positionSelect.innerHTML = getPositionOptions(selectedDepartmentId, null);
            managerSelect.innerHTML = `<option value="">无</option>` + getManagerOptions(selectedDepartmentId, null);
        });

        // Address selectors logic
        const provinceSelect = document.getElementById('province-select');
        const citySelect = document.getElementById('city-select');
        const districtSelect = document.getElementById('district-select');

        const populateProvinces = () => {
             const provinces = AppState.locations.map(p => p.province);
             provinceSelect.innerHTML = '<option value="">选择省份</option>' + provinces.map(p => `<option value="${p}" ${user.address?.province === p ? 'selected' : ''}>${p}</option>`).join('');
        }

        const populateCities = (provinceName) => {
            citySelect.innerHTML = '<option value="">选择城市</option>';
            districtSelect.innerHTML = '<option value="">选择区/县</option>';
            if (!provinceName) return;
            
            const province = AppState.locations.find(p => p.province === provinceName);
            if (!province) return;

            const cities = province.citys.map(c => c.city);
            citySelect.innerHTML = '<option value="">选择城市</option>' + cities.map(c => `<option value="${c}" ${user.address?.city === c ? 'selected' : ''}>${c}</option>`).join('');
        };

        const populateDistricts = (provinceName, cityName) => {
            districtSelect.innerHTML = '<option value="">选择区/县</option>';
            if (!provinceName || !cityName) return;

            const province = AppState.locations.find(p => p.province === provinceName);
            if (!province) return;
            
            const city = province.citys.find(c => c.city === cityName);
            if (!city) return;

            const districts = city.areas.map(a => a.area);
            districtSelect.innerHTML = '<option value="">选择区/县</option>' + districts.map(d => `<option value="${d}" ${user.address?.district === d ? 'selected' : ''}>${d}</option>`).join('');
        };
        
        // Event Listeners for address
        provinceSelect.addEventListener('change', () => {
            populateCities(provinceSelect.value);
            populateDistricts(provinceSelect.value, null); // Reset city & district
        });
        citySelect.addEventListener('change', () => {
            populateDistricts(provinceSelect.value, citySelect.value);
        });
        
        // Initial population
        populateProvinces();
        if (!isNew && user.address?.province) {
            populateCities(user.address.province);
            if(user.address?.city){
                 populateDistricts(user.address.province, user.address.city);
            }
        }
    },

    renderDepartmentManagement(container) {
        const departments = Object.values(AppState.departments);
        container.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-slate-800">部门列表</h2>
                    <button id="add-department-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4"></i>新增部门
                    </button>
                </div>
                <div class="bg-white rounded-xl shadow-sm border overflow-hidden mt-4">
                    <table class="w-full text-left">
                       <thead class="bg-slate-50">
                           <tr>
                               <th class="p-4 text-sm font-semibold text-slate-600">部门ID</th>
                               <th class="p-4 text-sm font-semibold text-slate-600">部门名称</th>
                               <th class="p-4 text-sm font-semibold text-slate-600 text-right">操作</th>
                           </tr>
                       </thead>
                       <tbody class="divide-y divide-slate-200">
                       ${departments.map(dept => `
                        <tr class="hover:bg-slate-50">
                           <td class="p-4 font-medium text-slate-800">${dept.departmentId}</td>
                           <td class="p-4 text-slate-600">${dept.name}</td>
                           <td class="p-4 text-slate-600 text-right">
                                <button data-department-id="${dept.departmentId}" class="delete-department-btn text-red-500 hover:text-red-700 font-medium">删除</button>
                           </td>
                        </tr>
                       `).join('')}
                       </tbody>
                    </table>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    renderAddDepartmentModal() {
        const content = `
            <form id="add-department-form">
                <div class="space-y-4">
                    ${Helpers.renderEditableRow('部门名称', `<input type="text" name="departmentName" required class="form-input">`)}
                </div>
                <div class="mt-8 flex justify-end">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">确认新增</button>
                </div>
            </form>
        `;
        this.showModal('新增部门', content, 'max-w-md');
    },

    renderPositionManagement(container) {
        const positions = Object.values(AppState.positions);
        container.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-slate-800">职位列表</h2>
                    <button id="add-position-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4"></i>新增职位
                    </button>
                </div>
                <div class="bg-white rounded-xl shadow-sm border overflow-hidden mt-4">
                    <table class="w-full text-left">
                       <thead class="bg-slate-50">
                           <tr>
                               <th class="p-4 text-sm font-semibold text-slate-600">职位ID</th>
                               <th class="p-4 text-sm font-semibold text-slate-600">职位名称</th>
                               <th class="p-4 text-sm font-semibold text-slate-600">所属部门</th>
                               <th class="p-4 text-sm font-semibold text-slate-600 text-right">操作</th>
                           </tr>
                       </thead>
                       <tbody class="divide-y divide-slate-200">
                       ${positions.map(pos => `
                        <tr class="hover:bg-slate-50">
                           <td class="p-4 font-medium text-slate-800">${pos.positionId}</td>
                           <td class="p-4 text-slate-600">${pos.name}</td>
                           <td class="p-4 text-slate-600">${AppState.departments[pos.departmentId]?.name || '未分配'}</td>
                           <td class="p-4 text-slate-600 text-right">
                               <button data-position-id="${pos.positionId}" class="delete-position-btn text-red-500 hover:text-red-700 font-medium">删除</button>
                           </td>
                        </tr>
                       `).join('')}
                       </tbody>
                    </table>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    renderAddPositionModal() {
        const departmentOptions = Object.values(AppState.departments).map(d => `<option value="${d.departmentId}">${d.name}</option>`).join('');
        const content = `
            <form id="add-position-form">
                <div class="space-y-4">
                    ${Helpers.renderEditableRow('所属部门', `<select name="departmentId" required class="form-select">${departmentOptions}</select>`)}
                    ${Helpers.renderEditableRow('职位名称', `<input type="text" name="positionName" required class="form-input">`)}
                </div>
                <div class="mt-8 flex justify-end">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">确认新增</button>
                </div>
            </form>
        `;
        this.showModal('新增职位', content, 'max-w-md');
    },
};

// --- 事件处理和逻辑模块 ---
const App = {
    init() {
        this.setupEventListeners();
        
        const loggedInRole = sessionStorage.getItem('loggedInUserRole');
        const roleSwitcher = document.getElementById('role-switcher');
        if (roleSwitcher && loggedInRole) {
            roleSwitcher.value = loggedInRole;
        }
        
        this.handleRoleChange();
    },
    
    setupEventListeners() {
        document.getElementById('role-switcher').addEventListener('change', this.handleRoleChange.bind(this));
        document.getElementById('menu-toggle').addEventListener('click', this.toggleSidebar.bind(this));
        document.getElementById('sidebar-nav').addEventListener('click', this.handleNavClick.bind(this));
        
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#new-order-btn')) UI.renderNewOrderForm();
            if (e.target.closest('#add-employee-btn')) UI.renderEmployeeModal(null);
            if (e.target.closest('#add-department-btn')) UI.renderAddDepartmentModal();
            if (e.target.closest('#add-position-btn')) UI.renderAddPositionModal();
            if (e.target.closest('.delete-department-btn')) {
                const departmentId = e.target.closest('.delete-department-btn').dataset.departmentId;
                const departmentName = AppState.departments[departmentId]?.name;
                 if (confirm(`确定要删除部门 "${departmentName}" 吗？此操作不可逆！`)) {
                    this.handleDeleteDepartment(departmentId);
                }
            }
            if (e.target.closest('.delete-position-btn')) {
                const positionId = e.target.closest('.delete-position-btn').dataset.positionId;
                const positionName = AppState.positions[positionId]?.name;
                if (confirm(`确定要删除职位 "${positionName}" 吗？此操作不可逆！`)) {
                    this.handleDeletePosition(positionId);
                }
            }
            if (e.target.closest('.edit-employee-btn')) {
                const userId = e.target.closest('.edit-employee-btn').dataset.userId;
                UI.renderEmployeeModal(userId);
            }
            if (e.target.closest('#write-report-btn')) UI.renderDailyReportModal();
            if (e.target.closest('#optimize-report-btn')) this.handleOptimizeReport(e);
            if (e.target.closest('#generate-summary-btn')) this.handleGenerateSummary(e);
            if (e.target.closest('.update-progress-btn')) UI.renderProgressModal(e.target.dataset.taskId);
            if (e.target.closest('.assign-order-to-lead-btn')) this.handleAssignOrderToLead(e);
            if (e.target.closest('.assign-task-to-member-btn')) UI.renderAssignTaskModal(e.target.dataset.taskId);
            if (e.target.closest('.view-client-details')) { e.preventDefault(); UI.renderClientDetailsModal(e.target.dataset.clientId); }
            if (e.target.closest('#add-follow-up-btn')) { e.preventDefault(); UI.renderFollowUpModal(e.target.dataset.clientId); }
            if (e.target.closest('#edit-profile-btn')) { e.preventDefault(); UI.renderEditProfileModal(); }
            if (e.target.closest('#logout-btn')) { e.preventDefault(); this.handleLogout(); }
            if (e.target.closest('#team-chart-back-btn')) {
                AppState.teamChartState = { view: 'departments', departmentId: null };
                UI.renderTeamChart();
            }
            
            const orderCard = e.target.closest('[data-order-id]');
            if (orderCard && !e.target.closest('button')) UI.renderOrderDetails(orderCard.dataset.orderId);
            if (e.target.closest('.edit-personnel-btn')) {
                const userId = e.target.closest('.edit-personnel-btn').dataset.userId;
                UI.renderPersonnelFileModal(userId);
            }
            if (e.target.id === 'add-employee-btn') {
                this.renderEmployeeModal(null);
            }
        });

        document.body.addEventListener('submit', (e) => {
            if (e.target.id === 'daily-report-form') this.handleReportSubmit(e);
            if (e.target.id === 'new-order-form') { e.preventDefault(); alert("工单已创建（模拟）"); UI.hideModal(); }
            if (e.target.id === 'add-department-form') this.handleDepartmentFormSubmit(e);
            if (e.target.id === 'add-position-form') this.handlePositionFormSubmit(e);
            if (e.target.id === 'progress-update-form') this.handleProgressUpdate(e);
            if (e.target.id === 'assign-task-form') this.handleAssignTaskToMember(e);
            if (e.target.id === 'add-follow-up-form') this.handleAddFollowUp(e);
            if (e.target.id === 'employee-form') this.handleEmployeeFormSubmit(e);
            if (e.target.id === 'edit-profile-form') { e.preventDefault(); alert('个人信息已更新（模拟）'); UI.hideModal(); }
        });

        document.body.addEventListener('change', (e) => {
            if (e.target.id === 'analysis-period') {
                UI.updateAnalysisCharts(parseInt(e.target.value));
            }
            if (e.target.matches('.task-status-select')) {
                this.handleTaskStatusChange(e);
            }
        });
    },

    handleLogout() {
        sessionStorage.removeItem('loggedInUserRole');
        window.location.href = 'login.html';
    },

    handleAssignOrderToLead(e) {
        const orderId = e.target.dataset.orderId;
        const selectedLeadId = document.getElementById('assign-lead-select').value;
        if (!selectedLeadId) {
            alert('请选择一个组长进行指派。');
            return;
        }
        const order = AppState.work_orders.find(o => o.orderId === orderId);
        if (order) {
            order.leadId = selectedLeadId;
            alert(`工单 "${order.orderName}" 已成功指派。`);
            UI.hideModal();
            this.renderPage();
        }
    },

    handleAssignTaskToMember(e) {
        e.preventDefault();
        const form = e.target;
        const taskId = form.dataset.taskId;
        const memberId = document.getElementById('assign-member-select').value;
        
        const task = AppState.tasks.find(t => t.taskId === taskId);
        if (task) {
            task.assigneeId = memberId;
            task.status = 'in_progress';
            alert(`任务已分配给 ${AppState.users[memberId].name}。`);
            UI.hideModal();
            UI.renderOrderDetails(task.orderId); // Re-render the order details modal
        }
    },
    
    handleAddFollowUp(e) {
        e.preventDefault();
        const form = e.target;
        const clientId = form.dataset.clientId;
        const type = document.getElementById('follow-up-type').value;
        const notes = document.getElementById('follow-up-notes').value;

        if (!notes.trim()) {
            alert('请填写跟进内容。');
            return;
        }

        const newFollowUp = {
            followUpId: `fu_${Date.now()}`,
            clientId: clientId,
            salesId: AppState.currentUser.userId,
            followUpDate: new Date().toISOString().split('T')[0],
            type: type,
            notes: notes
        };

        AppState.follow_ups.push(newFollowUp);
        alert('跟进记录已添加。');
        UI.hideModal();
        UI.renderClientDetailsModal(clientId);
    },


    handleTaskStatusChange(e) {
        const selectEl = e.target;
        const taskId = selectEl.dataset.taskId;
        const newStatus = selectEl.value;

        const task = AppState.tasks.find(t => t.taskId === taskId);
        if (task) {
            task.status = newStatus;
            
            const orderTasks = AppState.tasks.filter(t => t.orderId === task.orderId);
            const allTasksCompleted = orderTasks.every(t => t.status === 'completed');
            
            if (allTasksCompleted) {
                const order = AppState.work_orders.find(o => o.orderId === task.orderId);
                if(order) {
                    order.status = 'completed';
                    order.progress = 100;
                    order.completedAt = new Date();
                     alert(`工单 "${order.orderName}" 的所有任务已完成，工单状态已自动更新！`);
                }
            }
            this.renderPage();
        }
    },

    handleProgressUpdate(e) {
        e.preventDefault();
        const form = e.target;
        const orderId = form.dataset.orderId;
        const newProgress = document.getElementById('progress-slider').value;

        const order = AppState.work_orders.find(o => o.orderId === orderId);
        if (order) {
            order.progress = parseInt(newProgress);
            if (order.progress === 100) {
                order.status = 'completed';
                order.completedAt = new Date();
            } else {
                 order.status = 'in_progress';
                 order.completedAt = null;
            }
        }
        UI.hideModal();
        this.renderPage();
        alert('工单进度已更新！');
    },

    handleOptimizeReport(e) {
        // Functionality disabled as per request.
        alert('AI 功能当前已禁用。');
    },
    
    handleGenerateSummary(e) {
        // Functionality disabled as per request.
        alert('AI 功能当前已禁用。');
    },

    handleReportSubmit(e) {
        e.preventDefault();
        const content = document.getElementById('report-content').value;
        if (!content.trim()) {
            alert('日报内容不能为空。');
            return;
        }
        const newReport = {
            reportId: `report_${Date.now()}`,
            employeeId: AppState.currentUser.userId,
            reportDate: new Date().toISOString().split('T')[0],
            content: content.trim()
        };
        AppState.daily_reports.push(newReport);
        UI.hideModal();
        UI.renderDailyReport(document.getElementById('app'));
        alert('日报提交成功！');
    },

    getAnalysisData(days) {
        const isManager = ['prod_manager', 'art_lead'].includes(AppState.currentUser.role);
        const currentUserId = AppState.currentUser.userId;
        const startDate = getPastDate(days);
        
        const trendLabels = [];
        const trendDataMap = new Map();
        for (let i = days - 1; i >= 0; i--) {
            const d = getPastDate(i);
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            trendLabels.push(label);
            trendDataMap.set(label, { completedOrders: 0, detailPages: 0, imageCounts: 0 });
        }

        const categoryDataMap = new Map();

        const relevantLogs = isManager 
            ? AppState.performance_logs 
            : AppState.performance_logs.filter(log => log.employeeId === currentUserId);
        
        const relevantCompletedOrders = AppState.work_orders.filter(order => {
            if (order.status !== 'completed' || new Date(order.completedAt) < startDate) {
                return false;
            }
            if (isManager) return true;
            return AppState.tasks.some(task => task.orderId === order.orderId && task.assigneeId === currentUserId);
        });

        relevantCompletedOrders.forEach(order => {
            const trendLabel = `${new Date(order.completedAt).getMonth() + 1}/${new Date(order.completedAt).getDate()}`;
            if (trendDataMap.has(trendLabel)) {
                trendDataMap.get(trendLabel).completedOrders++;
            }
            const category = order.productCategory || '未分类';
            categoryDataMap.set(category, (categoryDataMap.get(category) || 0) + 1);
        });

        relevantLogs.forEach(log => {
            const logDate = new Date(log.logDate);
             if (logDate >= startDate) {
                 const label = `${logDate.getMonth() + 1}/${logDate.getDate()}`;
                 if (trendDataMap.has(label)) {
                    trendDataMap.get(label).detailPages += log.detailCount;
                    trendDataMap.get(label).imageCounts += log.imageCount;
                }
            }
        });
        
        return {
            trend: {
                labels: trendLabels,
                completedOrders: trendLabels.map(l => trendDataMap.get(l).completedOrders),
                detailPages: trendLabels.map(l => trendDataMap.get(l).detailPages),
                imageCounts: trendLabels.map(l => trendDataMap.get(l).imageCounts),
            },
            category: {
                labels: Array.from(categoryDataMap.keys()),
                data: Array.from(categoryDataMap.values()),
            }
        };
    },

    handleRoleChange() {
        const roleSwitcher = document.getElementById('role-switcher');
        const selectedRole = roleSwitcher.value;
        const userMap = {
            'sales': 'user_sales_wang',
            'prod_manager': 'user_prod_zhao',
            'art_lead': 'user_art_li',
            'art_staff': 'user_art_zhang',
            'render_staff': 'user_render_sun',
            'kanban_supervisor': 'user_supervisor_zhou',
            'hr': 'user_hr_chen'
        };
        AppState.currentUser = AppState.users[userMap[selectedRole]];
        
        sessionStorage.setItem('loggedInUserRole', selectedRole);

        if (selectedRole === 'sales') {
            AppState.currentPage = 'sales_dashboard';
        } else if (selectedRole === 'kanban_supervisor') {
            AppState.currentPage = 'supervisor_dashboard';
        } else if (selectedRole === 'hr') {
            AppState.currentPage = 'employee_management';
        } else {
            AppState.currentPage = 'dashboard';
        }
        
        document.getElementById('user-info').innerHTML = `
            <div class="flex items-center gap-3">
                ${Helpers.getAvatar(AppState.currentUser)}
                <div>
                    <p class="font-semibold text-sm text-slate-800">${AppState.currentUser.name}</p>
                    <p class="text-xs text-slate-500 capitalize">${AppState.currentUser.role.replace('_', ' ')}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button id="edit-profile-btn" class="text-slate-500 hover:text-indigo-600" title="个人中心">
                    <i data-lucide="settings-2" class="w-4 h-4"></i>
                </button>
                <button id="logout-btn" class="text-slate-500 hover:text-red-600" title="退出登录">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                </button>
            </div>
        `;

        lucide.createIcons();
        this.renderPage();
    },

    renderPage() {
        UI.renderPage();
    },

    handleNavClick(e) {
        e.preventDefault();
        const link = e.target.closest('a[data-page]');
        if (link && link.dataset.page !== AppState.currentPage) {
            App.navigateTo(link.dataset.page);
        }
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
    },

    getDepartmentalData(departmentIds, currentUser) {
        const result = {};

        departmentIds.forEach(deptId => {
            result[deptId] = {
                name: AppState.departments[deptId].name,
                inProgressCount: 0,
                members: []
            };
            
            let members;
            if (currentUser.role === 'kanban_supervisor') {
                members = Object.values(AppState.users).filter(u => u.departmentId === deptId && (u.role.endsWith('_staff') || u.role.endsWith('_lead')));
            } else { // Team lead view
                members = Object.values(AppState.users).filter(u => u.departmentId === deptId && u.role.endsWith('_staff'));
            }
            
            members.forEach(member => {
                const memberTasks = AppState.tasks.filter(t => t.assigneeId === member.userId);
                const inProgressCount = memberTasks.filter(t => t.status === 'in_progress').length;
                const completedTasks = memberTasks.filter(t => t.status === 'completed');
                
                result[deptId].inProgressCount += inProgressCount;

                const logs = AppState.performance_logs.filter(l => l.employeeId === member.userId);
                const totalHours = logs.reduce((sum, log) => sum + log.workHours, 0);
                
                result[deptId].members.push({
                    ...member,
                    inProgressCount: inProgressCount,
                    completedCount: completedTasks.length,
                    avgHours: logs.length > 0 ? totalHours / logs.length : 0
                });
            });
        });

        return result;
    },

    async submitDailyReport(content) {
        if (!content.trim()) {
            alert('日报内容不能为空。');
            return;
        }
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));

        const newReport = {
            reportId: 'rep' + (AppState.daily_reports.length + 1),
            employeeId: AppState.currentUser.userId,
            reportDate: new Date().toISOString(),
            content: content.trim()
        };
        AppState.daily_reports.push(newReport);
        
        // We don't need to manually re-render, the note gets updated in place.
    },

    async handleLoginForm(e) {
        // ... existing code ...
    },

    handleEmployeeFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const userId = form.dataset.userId;
        const isNew = !userId;

        const newUserId = isNew ? `user_${Date.now()}` : userId;
        
        const userData = {
            userId: newUserId,
            name: form.elements.name.value,
            gender: form.elements.gender.value,
            email: form.elements.email.value,
            phone: form.elements.phone.value,
            birth_date: form.elements.birth_date.value,
            hire_date: form.elements.hire_date.value,
            departmentId: form.elements.departmentId.value,
            department: AppState.departments[form.elements.departmentId.value]?.name,
            positionId: form.elements.positionId.value,
            position: AppState.positions[form.elements.positionId.value]?.name,
            manager_id: form.elements.manager_id.value,
            base_salary: parseFloat(form.elements.base_salary.value),
            performance_salary: parseFloat(form.elements.performance_salary.value) || 0,
            is_probation: form.elements.is_probation.checked,
            status: form.elements.status.value,
            address: {
                province: form.elements.province.value,
                city: form.elements.city.value,
                district: form.elements.district.value,
                street: form.elements.street_address.value
            },
            emergency_contact: {
                name: form.elements.emergency_contact_name.value,
                phone: form.elements.emergency_contact_phone.value
            },
            education: form.elements.education.value,
            university: form.elements.university.value,
            major: form.elements.major.value,
            graduation_date: form.elements.graduation_date.value,
            id_number: form.elements.id_number.value,
            nationality: form.elements.nationality.value,
            marital_status: form.elements.marital_status.value,
            bank_account: form.elements.bank_account.value,
            // Fields not in the form but need to be preserved or initialized
            role: isNew ? 'engineer' : AppState.users[userId].role, // default role
            avatar: isNew ? `https://i.pravatar.cc/150?u=${newUserId}` : AppState.users[userId].avatar,
            password: isNew ? 'password123' : AppState.users[userId].password,
            created_at: isNew ? new Date().toISOString() : AppState.users[userId].created_at,
            updated_at: new Date().toISOString(),
            // These performance fields are now on the form
            work_performance_score: parseFloat(form.elements.work_performance_score.value) || 0,
            attendance_performance_score: parseFloat(form.elements.attendance_performance_score.value) || 0,
        };

        AppState.users[newUserId] = userData;
        
        UI.hideModal();
        if (AppState.currentPage === 'employee_management') {
            this.navigateTo('employee_management');
        } else {
            // If editing from another page, e.g. personnel file, refresh that
            this.navigateTo(AppState.currentPage);
        }
    },

    handlePersonnelFileFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const userId = form.dataset.userId;
        if (!userId) return;

        const user = AppState.users[userId];
        user.contractInfo = form.elements.contractInfo.value;
        user.salaryRecords = form.elements.salaryRecords.value;
        user.performanceReviews = form.elements.performanceReviews.value;

        UI.hideModal();
        
        // Re-render the list to be safe, though no new data is displayed in the table itself.
        UI._renderPersonnelFileList(Object.values(AppState.users));
    },
    
    navigateTo(page) {
        AppState.currentPage = page;
        this.renderPage();
    },

    handleDepartmentFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const departmentName = form.elements.departmentName.value;

        if (departmentName) {
            const newDepartmentId = `dept_${departmentName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
            AppState.departments[newDepartmentId] = {
                departmentId: newDepartmentId,
                name: departmentName
            };
            UI.hideModal();
            this.navigateTo('department_management');
        }
    },

    handleDeleteDepartment(departmentId) {
        if (AppState.departments[departmentId]) {
            delete AppState.departments[departmentId];
            this.navigateTo('department_management');
        }
    },

    handleDeletePosition(positionId) {
        if (AppState.positions[positionId]) {
            delete AppState.positions[positionId];
            this.navigateTo('position_management');
        }
    },

    handlePositionFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const positionName = form.elements.positionName.value;
        const departmentId = form.elements.departmentId.value;

        if (positionName && departmentId) {
            const newPositionId = `pos_${positionName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
            AppState.positions[newPositionId] = {
                positionId: newPositionId,
                name: positionName,
                departmentId: departmentId
            };
            UI.hideModal();
            this.navigateTo('position_management');
        }
    },
};

document.addEventListener('DOMContentLoaded', async () => {
    // This script runs on index.html, which contains the main app view.
    // The login page (login.html) has its own, separate script.
    if (document.getElementById('app-view')) {
        lucide.createIcons();
        App.init();
    }

    // Fetch and prepare location data
    try {
        // In a real app, this would be an API call. Here we simulate it.
        const locationData = [
            {
                "province": "北京市",
                "citys": [
                  {
                    "city": "北京市",
                    "areas": [
                      { "area": "东城区" }, { "area": "西城区" }, { "area": "朝阳区" }, { "area": "丰台区" }, { "area": "石景山区" }, { "area": "海淀区" }, { "area": "门头沟区" }, { "area": "房山区" }, { "area": "通州区" }, { "area": "顺义区" }, { "area": "昌平区" }, { "area": "大兴区" }, { "area": "怀柔区" }, { "area": "平谷区" }, { "area": "密云区" }, { "area": "延庆区" }
                    ]
                  }
                ]
              },
              {
                "province": "天津市",
                "citys": [
                  {
                    "city": "天津市",
                    "areas": [
                      { "area": "和平区" }, { "area": "河东区" }, { "area": "河西区" }, { "area": "南开区" }, { "area": "河北区" }, { "area": "红桥区" }, { "area": "东丽区" }, { "area": "西青区" }, { "area": "津南区" }, { "area": "北辰区" }, { "area": "武清区" }, { "area": "宝坻区" }, { "area": "滨海新区" }, { "area": "宁河区" }, { "area": "静海区" }, { "area": "蓟州区" }
                    ]
                  }
                ]
              },
              {
                "province": "河北省",
                "citys": [
                  {
                    "city": "石家庄市",
                    "areas": [
                      { "area": "长安区" }, { "area": "桥西区" }, { "area": "新华区" }, { "area": "井陉矿区" }, { "area": "裕华区" }, { "area": "藁城区" }, { "area": "鹿泉区" }, { "area": "栾城区" }, { "area": "井陉县" }, { "area": "正定县" }, { "area": "行唐县" }, { "area": "灵寿县" }
                    ]
                  }
                ]
            }
        ];
        AppState.locations = locationData;
    } catch (error) {
        console.error("无法加载地区数据:", error);
        AppState.locations = {}; // Fallback
    }

    const app = new App();
    window.App = app;
});