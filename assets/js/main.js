alert('新的JS脚本已加载！');
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
        'client_1': { 
            clientId: 'client_1', 
            name: '时尚潮流服饰', 
            contactName: '陈经理', 
            contactPhone: '13812345671', 
            depositPaid: 2000,
            customerSource: '线上',
            customerSize: '中'
        },
        'client_2': { 
            clientId: 'client_2', 
            name: '智能家居生活馆', 
            contactName: '李总', 
            contactPhone: '13912345672', 
            depositPaid: 5000,
            customerSource: '线下',
            customerSize: '大'
        },
        'client_3': { 
            clientId: 'client_3', 
            name: '美味零食铺', 
            contactName: '张小姐', 
            contactPhone: '13712345673', 
            depositPaid: 300,
            customerSource: '活动',
            customerSize: '小'
        },
        'client_4': { 
            clientId: 'client_4', 
            name: '电子产品专营店', 
            contactName: '王总', 
            contactPhone: '13812345674', 
            depositPaid: 8000,
            customerSource: '线下',
            customerSize: '大'
        },
        'client_5': { 
            clientId: 'client_5', 
            name: '健康食品商城', 
            contactName: '赵经理', 
            contactPhone: '13812345675', 
            depositPaid: 1500,
            customerSource: '线上',
            customerSize: '中'
        },
    },
    departments: {
        'dept_sales': { departmentId: 'dept_sales', name: '销售部' },
        'dept_prod': { departmentId: 'dept_prod', name: '生产部' },
        'dept_art': { departmentId: 'dept_art', name: '美工部' },
        'dept_render': { departmentId: 'dept_render', name: '渲染部' },
        'dept_mgmt': { departmentId: 'dept_mgmt', name: '管理部' },
        'dept_hr': { departmentId: 'dept_hr', name: '人力资源部' },
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
        { orderId: 'order_1', orderName: '夏季T恤新品主图', clientId: 'client_1', leadId: 'user_art_li', status: 'in_progress', type: 'non_shooting', needRendering: false, createdAt: getPastDate(1), createdBy: 'user_sales_wang', progress: 75, contractAmount: 5000, isTrial: false, startDate: getPastDate(1).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '服装', priority: 'Medium', dueDate: getPastDate(-5).toISOString().split('T')[0], description: '为夏季新款T恤制作一套完整的电商用主图，包括白底图、场景图和细节图。需要突出材质和设计特点。', customerSource: '线上', customerSize: '中', followUpStatus: 'following_up' },
        { orderId: 'order_2', orderName: '智能音箱渲染图', clientId: 'client_2', leadId: 'user_render_sun', status: 'in_progress', type: 'non_shooting', needRendering: true, createdAt: getPastDate(2), createdBy: 'user_sales_wang', progress: 40, contractAmount: 12000, isTrial: false, startDate: getPastDate(2).toISOString().split('T')[0], hasPhysicalObject: false, productCategory: '智能家居', priority: 'High', dueDate: getPastDate(-10).toISOString().split('T')[0], description: '为新款智能音箱提供三张不同角度和光线环境下的高精度渲染图，用于产品发布会。', customerSource: '线下', customerSize: '大', followUpStatus: 'about_to_close' },
        { orderId: 'order_3', orderName: '薯片包装拍摄', clientId: 'client_3', leadId: null, status: 'pending', type: 'shooting', needRendering: false, createdAt: getPastDate(3), createdBy: 'user_sales_wang', progress: 10, contractAmount: 800, isTrial: true, startDate: getPastDate(3).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '零食', priority: 'Low', dueDate: getPastDate(-2).toISOString().split('T')[0], description: '拍摄一组用于社交媒体宣传的薯片包装图，要求色彩鲜艳，有食欲。', customerSource: '活动', customerSize: '小', followUpStatus: 'just_started' },
        { orderId: 'order_4', orderName: '春季夹克详情页', clientId: 'client_1', leadId: 'user_art_li', status: 'completed', type: 'non_shooting', needRendering: false, createdAt: getPastDate(10), completedAt: getPastDate(7).toISOString().split('T')[0], createdBy: 'user_sales_wang', progress: 100, contractAmount: 4500, isTrial: false, startDate: getPastDate(10).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '服装', finalPaymentStatus: '已结算', priority: 'Medium', dueDate: getPastDate(-20).toISOString().split('T')[0], description: '设计制作春季新款夹克的电商详情页，包含模特图、细节图和尺码表。', customerSource: '线上', customerSize: '中', followUpStatus: 'closed' },
        { orderId: 'order_5', orderName: '运动鞋海报设计', clientId: 'client_1', leadId: 'user_art_li', status: 'completed', type: 'non_shooting', needRendering: false, createdAt: getPastDate(5), completedAt: getPastDate(2).toISOString().split('T')[0], createdBy: 'user_sales_wang', progress: 100, contractAmount: 3000, isTrial: false, startDate: getPastDate(5).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '服装', finalPaymentStatus: '待结算', priority: 'High', dueDate: getPastDate(-10).toISOString().split('T')[0], description: '设计一款突出科技感的运动鞋宣传海报。', customerSource: '活动', customerSize: '中', followUpStatus: 'closed' },
        { orderId: 'order_6', orderName: '新款手机渲染', clientId: 'client_2', leadId: 'user_render_sun', status: 'completed', type: 'non_shooting', needRendering: true, createdAt: getPastDate(8), completedAt: getPastDate(1).toISOString().split('T')[0], createdBy: 'user_sales_wang', progress: 100, contractAmount: 25000, isTrial: false, startDate: getPastDate(8).toISOString().split('T')[0], hasPhysicalObject: false, productCategory: '手机', finalPaymentStatus: '已结算', priority: 'High', dueDate: getPastDate(-15).toISOString().split('T')[0], description: '对新款手机进行全方位高精度渲染。', customerSource: '线下', customerSize: '大', followUpStatus: 'closed' },
        { orderId: 'order_7', orderName: '电风扇拍摄', clientId: 'client_2', leadId: 'user_art_li', status: 'completed', type: 'shooting', needRendering: false, createdAt: getPastDate(12), completedAt: getPastDate(9).toISOString().split('T')[0], createdBy: 'user_sales_wang', progress: 100, contractAmount: 1500, isTrial: false, startDate: getPastDate(12).toISOString().split('T')[0], hasPhysicalObject: true, productCategory: '电风扇', finalPaymentStatus: '待结算', priority: 'Low', dueDate: getPastDate(-22).toISOString().split('T')[0], description: '拍摄一组简约风格的电风扇产品图。', customerSource: '线上', customerSize: '大', followUpStatus: 'closed' },
        { orderId: 'order_8', orderName: '高端化妆品包装设计', clientId: 'client_4', leadId: 'user_art_li', status: 'cancelled', type: 'non_shooting', needRendering: false, createdAt: getPastDate(20), createdBy: 'user_sales_wang', progress: 0, contractAmount: 18000, isTrial: false, startDate: getPastDate(20).toISOString().split('T')[0], hasPhysicalObject: false, productCategory: '化妆品', priority: 'High', dueDate: getPastDate(-30).toISOString().split('T')[0], description: '客户已明确表示选择其他供应商。', customerSource: '线下', customerSize: '大', followUpStatus: 'customer_lost' }
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
    ],
    activities: [
        { activityId: 'act_1', orderId: 'order_1', userId: 'user_sales_wang', type: 'CREATE_ORDER', content: '创建了工单', timestamp: getPastDate(1) },
        { activityId: 'act_2', orderId: 'order_1', userId: 'user_prod_zhao', type: 'ASSIGN_LEAD', content: '将工单指派给了 <strong>李四</strong>', timestamp: getPastDate(1) },
        { activityId: 'act_3', orderId: 'order_1', userId: 'user_art_li', type: 'ASSIGN_TASK', content: '将任务 "制作3张白底主图" 指派给了 <strong>张三</strong>', timestamp: getPastDate(1) },
        { activityId: 'act_4', orderId: 'order_1', userId: 'user_art_zhang', type: 'COMMENT', content: '白底图初稿已完成，请查收。', timestamp: getPastDate(0) },
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
    filters: {
        status: [],
        source: [],
    },
};

// --- 辅助函数 ---
const Helpers = {
    getAvatar(user) {
        if (!user) return '';

        // Handle unassigned/invalid users that don't have a userId
        if (!user.userId) {
            return `
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-slate-200 text-slate-500" title="${user.name || 'Unassigned'}">
                    ${user.initials || '?'}
                </div>
            `;
        }

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
    init() {
        // 确保AppState中的数据结构已初始化
        if (!AppState.users) AppState.users = {};
        if (!AppState.clients) AppState.clients = {};
        if (!AppState.work_orders) AppState.work_orders = [];
        if (!AppState.activities) AppState.activities = [];
        if (!AppState.userRoles) {
            AppState.userRoles = {
                'sales': { defaultPage: 'client_followups' },
                'prod_manager': { defaultPage: 'dashboard' },
                'art_lead': { defaultPage: 'team' },
                'art_staff': { defaultPage: 'my_tasks' },
                'render_staff': { defaultPage: 'my_tasks' },
                'kanban_supervisor': { defaultPage: 'analysis' },
                'hr': { defaultPage: 'hr_management' }
            };
        }
        
        // 初始化过滤器状态
        if (!AppState.filters) {
            AppState.filters = {
                status: [],
                source: []
            };
        }
        
        this.setupEventListeners();
    },

    // 完全移除bindEvents方法

    setupEventListeners() {
        // Delegated event listeners for dynamic content in #app
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.addEventListener('click', (e) => {
                const followUpBtn = e.target.closest('.follow-up-btn');
                const filterBtn = e.target.closest('#filter-btn');
                const ticketRow = e.target.closest('.ticket-row');

                if (followUpBtn) {
                    e.stopPropagation();
                    // 使用直接引用而不是this
                    const ticketId = followUpBtn.dataset.ticketId;
                    if (ticketId) {
                        const ticket = AppState.work_orders.find(o => o.orderId === ticketId);
                        if (ticket) {
                            UI.renderFollowUpRecordModal(ticketId);
                        }
                    }
                    return;
                }
                
                if (filterBtn) {
                    document.getElementById('filter-dropdown').classList.toggle('hidden');
                    return;
                }

                if (ticketRow && !e.target.closest('input, a, button')) {
                    appContainer.querySelectorAll('.ticket-row').forEach(r => r.classList.remove('bg-indigo-50'));
                    ticketRow.classList.add('bg-indigo-50');
                    UI.renderTicketDetailsPanel(ticketRow.dataset.ticketId);
                    return;
                }
            });

            appContainer.addEventListener('change', (e) => {
                const filterCheckbox = e.target.closest('input[type="checkbox"][data-filter-type]');
                if (filterCheckbox) {
                    const { filterType, value } = filterCheckbox.dataset;
                    const isChecked = filterCheckbox.checked;
                    
                    if (isChecked) {
                        AppState.filters[filterType].push(value);
                    } else {
                        AppState.filters[filterType] = AppState.filters[filterType].filter(item => item !== value);
                    }
                    UI.renderClientFollowUps(appContainer);
                }
            });
        }
        
        // Global listener to close filter dropdown
        document.body.addEventListener('click', (e) => {
            const filterDropdown = document.getElementById('filter-dropdown');
            if (filterDropdown && !e.target.closest('#filter-btn, #filter-dropdown')) {
                filterDropdown.classList.add('hidden');
            }
        }, true);

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal' || e.target.closest('.modal-close-btn')) {
                UI.hideModal();
            }
        });
        
        document.getElementById('menu-toggle')?.addEventListener('click', () => UI.toggleSidebar());
        document.getElementById('desktop-sidebar-toggle')?.addEventListener('click', () => UI.toggleDesktopSidebar());
    },

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
            case 'client_followups':
                pageTitleEl.textContent = '客户跟踪记录';
                this.renderClientFollowUps(appContentEl);
                // 客户跟踪记录页面的特殊处理会在renderClientFollowUps中完成
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
                
            case 'order_board':
                const order = AppState.work_orders.find(o => o.orderId === AppState.selectedOrderId);
                pageTitleEl.textContent = order ? `工单详情：${order.orderName}` : '工单详情';
                this.renderOrderBoard(appContentEl);
                break;
        }
        lucide.createIcons();
        
        // 移除对未定义tickets变量的引用
        // 客户跟踪记录页面的初始选择已经在renderClientFollowUps中处理
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
                <a href="#" class="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group" data-page="client_followups">
                    <i data-lucide="contact" class="w-5 h-5 text-slate-500 group-hover:text-slate-900"></i><span class="ms-3">客户跟踪记录</span>
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
        
        // 计算本月和上月的数据
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        // 过滤本月和上月的订单
        const currentMonthOrders = myOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });
        
        const lastMonthOrders = myOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
        });
        
        // 计算销售额数据
        const currentMonthSales = currentMonthOrders.reduce((sum, order) => sum + order.contractAmount, 0);
        const lastMonthSales = lastMonthOrders.reduce((sum, order) => sum + order.contractAmount, 0);
        const salesChange = lastMonthSales === 0 ? 100 : ((currentMonthSales - lastMonthSales) / lastMonthSales * 100);
        
        // 计算我的提点数据（假设提点为销售额的5%）
        const commissionRate = 0.05;
        const currentMonthCommission = currentMonthSales * commissionRate;
        const lastMonthCommission = lastMonthSales * commissionRate;
        const commissionChange = lastMonthCommission === 0 ? 100 : ((currentMonthCommission - lastMonthCommission) / lastMonthCommission * 100);
        
        // 计算订单数量数据
        const currentMonthOrderCount = currentMonthOrders.length;
        const lastMonthOrderCount = lastMonthOrders.length;
        const orderCountChange = lastMonthOrderCount === 0 ? 100 : ((currentMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount * 100);
        
        // 计算待结算订单数据
        const currentMonthPendingOrders = currentMonthOrders.filter(o => o.status === 'completed' && o.finalPaymentStatus === '待结算').length;
        const lastMonthPendingOrders = lastMonthOrders.filter(o => o.status === 'completed' && o.finalPaymentStatus === '待结算').length;
        const pendingOrdersChange = lastMonthPendingOrders === 0 ? 100 : ((currentMonthPendingOrders - lastMonthPendingOrders) / lastMonthPendingOrders * 100);
        
        // 辅助函数：生成趋势指示器
        const getTrendIndicator = (change) => {
            const isPositive = change > 0;
            const icon = isPositive ? 'trending-up' : 'trending-down';
            const colorClass = isPositive ? 'text-red-500' : 'text-green-500';
            return `<span class="${colorClass} flex items-center text-sm ml-1">
                      <i data-lucide="${icon}" class="w-4 h-4 mr-1"></i>${Math.abs(change).toFixed(1)}%
                    </span>`;
        };

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <!-- 1. 销售额 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
                    <div class="p-3 bg-indigo-100 rounded-lg"><i data-lucide="dollar-sign" class="w-7 h-7 text-indigo-600"></i></div>
                    <div class="flex-1">
                        <div class="flex items-center">
                            <p class="text-sm text-slate-500">本月销售额</p>
                            ${getTrendIndicator(salesChange)}
                        </div>
                        <p class="text-3xl font-bold text-slate-800">¥${currentMonthSales.toLocaleString()}</p>
                    </div>
                </div>
                
                <!-- 2. 我的提点 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
                    <div class="p-3 bg-green-100 rounded-lg"><i data-lucide="piggy-bank" class="w-7 h-7 text-green-600"></i></div>
                    <div class="flex-1">
                        <div class="flex items-center">
                            <p class="text-sm text-slate-500">本月提点</p>
                            ${getTrendIndicator(commissionChange)}
                        </div>
                        <p class="text-3xl font-bold text-slate-800">¥${currentMonthCommission.toLocaleString()}</p>
                    </div>
                </div>
                
                <!-- 3. 订单数量 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
                    <div class="p-3 bg-blue-100 rounded-lg"><i data-lucide="package" class="w-7 h-7 text-blue-600"></i></div>
                    <div class="flex-1">
                        <div class="flex items-center">
                            <p class="text-sm text-slate-500">本月订单数</p>
                            ${getTrendIndicator(orderCountChange)}
                        </div>
                        <p class="text-3xl font-bold text-slate-800">${currentMonthOrderCount}</p>
                    </div>
                </div>
                
                <!-- 4. 待结算订单 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
                    <div class="p-3 bg-yellow-100 rounded-lg"><i data-lucide="receipt" class="w-7 h-7 text-yellow-600"></i></div>
                    <div class="flex-1">
                        <div class="flex items-center">
                            <p class="text-sm text-slate-500">待结算订单</p>
                            ${getTrendIndicator(pendingOrdersChange)}
                        </div>
                        <p class="text-3xl font-bold text-yellow-500">${currentMonthPendingOrders}</p>
                    </div>
                </div>
            </div>

            <!-- 收入预测和来源详情 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- 收入预测 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-slate-800">收入预测</h3>
                        <div class="flex bg-slate-100 rounded-lg p-1 text-sm">
                            <button class="px-3 py-1 rounded-md bg-white shadow-sm">月度</button>
                            <button class="px-3 py-1 text-slate-600">季度</button>
                            <button class="px-3 py-1 text-slate-600">年度</button>
                        </div>
                    </div>
                    
                    <div class="flex items-center mb-5">
                        <h2 class="text-2xl font-bold">¥301,800</h2>
                        <span class="text-green-500 flex items-center text-sm ml-2">
                            <i data-lucide="trending-up" class="w-4 h-4 mr-1"></i>5.2%
                        </span>
                        <span class="text-slate-500 text-sm ml-2">同比上期</span>
                    </div>
                    
                    <div class="h-64 mb-4">
                        <canvas id="revenueChart"></canvas>
                    </div>
                    
                    <div class="flex gap-8 text-sm">
                        <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                            <span>收入</span>
                            <span class="ml-2 font-medium">¥50,300</span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                            <span>目标</span>
                            <span class="ml-2 font-medium">¥65,390</span>
                        </div>
                    </div>
                </div>
                
                <!-- 来源详情 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-slate-800">来源</h3>
                        <div class="relative">
                            <button class="px-3 py-1.5 bg-white border rounded-lg text-sm flex items-center">
                                周度
                                <i data-lucide="chevron-down" class="w-4 h-4 ml-1"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex items-center mb-4">
                        <h2 class="text-2xl font-bold">12,569</h2>
                        <span class="text-green-500 flex items-center text-sm ml-2">
                            <i data-lucide="trending-up" class="w-4 h-4 mr-1"></i>2.1%
                        </span>
                    </div>
                    
                    <div class="flex gap-2 mb-4 h-16">
                        <div class="flex-1 flex items-end">
                            ${Array.from({length: 15}, () => Math.floor(Math.random() * 30) + 10)
                                .map(h => `<div class="w-2 bg-indigo-400 mx-0.5" style="height: ${h}px"></div>`)
                                .join('')}
                        </div>
                        <div class="flex-1 flex items-end">
                            ${Array.from({length: 15}, () => Math.floor(Math.random() * 30) + 5)
                                .map(h => `<div class="w-2 bg-blue-300 mx-0.5" style="height: ${h}px"></div>`)
                                .join('')}
                        </div>
                        <div class="flex-1 flex items-end">
                            ${Array.from({length: 15}, () => Math.floor(Math.random() * 20) + 5)
                                .map(h => `<div class="w-2 bg-indigo-200 mx-0.5" style="height: ${h}px"></div>`)
                                .join('')}
                        </div>
                    </div>
                    
                    <div class="flex gap-4 mb-6">
                        <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full bg-indigo-400 mr-2"></span>
                            <span class="text-sm">线上</span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full bg-blue-300 mr-2"></span>
                            <span class="text-sm">线下</span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full bg-indigo-200 mr-2"></span>
                            <span class="text-sm">活动</span>
                        </div>
                    </div>
                    
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-slate-500">
                                <th class="text-left font-medium pb-2">详情</th>
                                <th class="text-left font-medium pb-2">指标</th>
                                <th class="text-right font-medium pb-2">总计</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="py-2">平均单价</td>
                                <td class="py-2">¥${currentMonthOrderCount > 0 ? (currentMonthSales/currentMonthOrderCount).toFixed(2) : 0}</td>
                                <td class="py-2 text-right">
                                    <span class="text-green-500 flex items-center justify-end">
                                        <i data-lucide="trending-up" class="w-4 h-4 mr-1"></i>1.1%
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td class="py-2">平均回款周期</td>
                                <td class="py-2">15.2 天</td>
                                <td class="py-2 text-right">
                                    <span class="text-red-500 flex items-center justify-end">
                                        <i data-lucide="trending-down" class="w-4 h-4 mr-1"></i>2.0%
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td class="py-2">ROI</td>
                                <td class="py-2">98%</td>
                                <td class="py-2 text-right">
                                    <span class="text-green-500 flex items-center justify-end">
                                        <i data-lucide="trending-up" class="w-4 h-4 mr-1"></i>1.7%
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="mt-4 text-center">
                        <button class="text-indigo-600 font-medium text-sm">查看报告</button>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                <h3 class="p-4 text-lg font-semibold text-slate-800 border-b">订单尾款跟踪</h3>
                <table class="w-full text-left">
                   <thead class="bg-slate-50">
                       <tr>
                           <th class="p-4 text-sm font-semibold text-slate-600">客户名称</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">合同金额</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">接入日期</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">已付金额</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">提点</th>
                           <th class="p-4 text-sm font-semibold text-slate-600">状态</th>
                       </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-200">
                   ${myOrders.filter(o => o.status === 'completed').map(order => {
                       const client = AppState.clients[order.clientId];
                       const paymentStatus = order.finalPaymentStatus;
                       // 计算已付金额和提点
                       const paidAmount = paymentStatus === '已结算' ? order.contractAmount : Math.round(order.contractAmount * 0.7);
                       const commission = Math.round(order.contractAmount * 0.05);
                       
                       let statusBadge = '';
                        if (paymentStatus === '已结算') {
                            statusBadge = 'status-badge-green';
                        } else if (paymentStatus === '待结算') {
                            statusBadge = 'status-badge-yellow';
                        } else {
                            statusBadge = 'status-badge-gray';
                        }
                       return `
                        <tr class="hover:bg-slate-50 cursor-pointer view-order-board" data-order-id="${order.orderId}">
                           <td class="p-4 font-medium text-slate-800">${client.name}</td>
                           <td class="p-4 text-slate-600">¥${order.contractAmount.toLocaleString()}</td>
                           <td class="p-4 text-slate-600">${new Date(order.startDate).toLocaleDateString()}</td>
                           <td class="p-4 text-slate-600">¥${paidAmount.toLocaleString()}</td>
                           <td class="p-4 text-slate-600">¥${commission.toLocaleString()}</td>
                           <td class="p-4"><span class="status-badge ${statusBadge}">${paymentStatus}</span></td>
                        </tr>
                       `
                   }).join('') || `<tr><td colspan="6" class="p-4 text-center text-slate-500">暂无已完成的订单</td></tr>`}
                   </tbody>
                </table>
             </div>
        `;
        lucide.createIcons();
        
        // 初始化收入预测图表
        setTimeout(() => {
            const ctx = document.getElementById('revenueChart');
            if (ctx && typeof Chart !== 'undefined') {
                // 生成月度数据
                const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月'];
                
                // 示例数据 - 根据参考图片的曲线
                const revenueData = [10000, 12000, 11000, 13000, 16000, 17000, 16500, 12000, 15000];
                const targetData = [5000, 8000, 6000, 6000, 9000, 7000, 6000, 9000, 10000];
                
                try {
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: months,
                            datasets: [
                                {
                                    label: '收入',
                                    data: revenueData,
                                    borderColor: '#6366f1',
                                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    borderWidth: 2,
                                    pointRadius: 3,
                                    pointBackgroundColor: '#6366f1'
                                },
                                {
                                    label: '目标',
                                    data: targetData,
                                    borderColor: '#60a5fa',
                                    tension: 0.4,
                                    borderWidth: 2,
                                    pointRadius: 2,
                                    pointBackgroundColor: '#60a5fa'
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false
                                },
                                tooltip: {
                                    mode: 'index',
                                    intersect: false,
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                                label += '¥' + context.parsed.y.toLocaleString();
                                            }
                                            return label;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    grid: {
                                        drawBorder: false,
                                        color: 'rgba(0, 0, 0, 0.05)'
                                    },
                                    ticks: {
                                        callback: function(value) {
                                            if (value >= 1000) {
                                                return '¥' + value / 1000 + 'k';
                                            }
                                            return '¥' + value;
                                        }
                                    }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    }
                                }
                            },
                            interaction: {
                                intersect: false,
                                mode: 'index'
                            },
                            elements: {
                                point: {
                                    radius: 0,
                                    hoverRadius: 5
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error('Chart initialization error:', error);
                    // 如果Chart.js未加载，显示简单的替代内容
                    ctx.parentNode.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-slate-50 rounded">
                            <div class="text-center text-slate-400">
                                <p>图表加载失败</p>
                                <p class="text-xs">请检查Chart.js库是否正确加载</p>
                            </div>
                        </div>
                    `;
                }
            } else if (ctx) {
                // Chart.js未加载，显示提示
                ctx.parentNode.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-slate-50 rounded">
                        <div class="text-center text-slate-400">
                            <p>图表库未加载</p>
                            <p class="text-xs">请确保已引入Chart.js</p>
                        </div>
                    </div>
                `;
                console.error('Chart.js is not defined. Please include the Chart.js library.');
            }
        }, 100);
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
            unassignedOrders = AppState.work_orders.filter(o => o.status === 'pending' || (o.status === 'in_progress' && !o.leadId));
            inProgressOrders = AppState.work_orders.filter(o => o.status === 'in_progress' && o.leadId);
            completedOrders = AppState.work_orders.filter(o => o.status === 'completed');
        } else if (isArtLead) {
            const myLeadOrders = AppState.work_orders.filter(o => o.leadId === currentUser.userId);
            
            unassignedOrders = myLeadOrders.filter(order => {
                const orderTasks = AppState.tasks.filter(t => t.orderId === order.orderId);
                return order.status === 'pending' || (order.status === 'in_progress' && orderTasks.length > 0 && orderTasks.some(t => !t.assigneeId));
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

        const unassignedColumnHtml = `
            <div class="bg-white/50 rounded-xl flex flex-col border">
                <h3 class="font-bold text-slate-800 p-4 border-b">未开始 (${unassignedOrders.length})</h3>
                <div class="p-4 space-y-4 overflow-y-auto flex-1">
                    ${unassignedOrders.map(order => this.renderOrderCard(order)).join('') || '<p class="text-slate-500 text-sm p-2">暂无工单</p>'}
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-white p-5 rounded-xl shadow-sm border"><p class="text-sm text-slate-500">进行中工单</p><p class="text-3xl font-bold text-slate-800">${allInProgressForStats.length}</p></div>
                <div class="bg-white p-5 rounded-xl shadow-sm border"><p class="text-sm text-slate-500">已完成工单</p><p class="text-3xl font-bold text-slate-800">${AppState.work_orders.filter(o => o.status === 'completed').length}</p></div>
                <div class="bg-white p-5 rounded-xl shadow-sm border"><p class="text-sm text-slate-500">黄色预警</p><p class="text-3xl font-bold text-yellow-500">${yellowAlerts}</p></div>
                <div class="bg-white p-5 rounded-xl shadow-sm border"><p class="text-sm text-slate-500">红色预警</p><p class="text-3xl font-bold text-red-500">${redAlerts}</p></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
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
        // This function is now replaced by renderOrderDetailsPanel
        this.renderOrderDetailsPanel(orderId);
    },
    renderOrderDetailsPanel(orderId) {
        const order = AppState.work_orders.find(o => o.orderId === orderId);
        if (!order) return;

        const tasks = AppState.tasks.filter(t => t.orderId === orderId);
        const assignees = [...new Set(tasks.map(t => AppState.users[t.assigneeId]).filter(Boolean))];
        const activities = AppState.activities.filter(a => a.orderId === orderId).sort((a,b) => b.timestamp - a.timestamp);
        const alertInfo = Helpers.getAlertLevel(order.createdAt);

        const priorityBadges = {
            'High': 'status-badge-red',
            'Medium': 'status-badge-yellow',
            'Low': 'status-badge-blue',
        };

        const statusBadges = {
            'in_progress': 'status-badge-yellow',
            'completed': 'status-badge-green',
            'pending': 'status-badge-gray',
        }

        const detailItem = (icon, label, value) => `
            <div class="grid grid-cols-4 gap-2 py-3">
                <dt class="col-span-1 flex items-center gap-2 text-sm text-slate-500">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                    <span>${label}</span>
                </dt>
                <dd class="col-span-3 text-sm text-slate-800 font-medium">${value}</dd>
            </div>
        `;

        const renderActivity = (activity) => {
            const user = AppState.users[activity.userId];
            const timeAgo = Math.round((new Date() - activity.timestamp) / (1000 * 60 * 60)); // hours ago
            
            return `
                <div class="flex gap-3">
                    <div>${Helpers.getAvatar(user)}</div>
                    <div class="flex-1">
                        <p class="text-sm">
                            <span class="font-semibold">${user.name}</span>
                            <span>${activity.content}</span>
                        </p>
                        <p class="text-xs text-slate-400 mt-0.5">${timeAgo <= 0 ? '刚刚' : `${timeAgo}小时前`}</p>
                    </div>
                </div>
            `;
        }

        const panelContent = `
            <div class="h-full flex flex-col">
                <!-- Panel Header -->
                <header class="flex-shrink-0 flex items-center justify-between p-4 border-b">
                    <h2 class="text-lg font-bold text-slate-800">${order.orderName}</h2>
                    <div class="flex items-center gap-2">
                        <button class="p-1.5 rounded-full text-slate-500 hover:bg-slate-100"><i data-lucide="star" class="w-5 h-5"></i></button>
                        <button class="p-1.5 rounded-full text-slate-500 hover:bg-slate-100"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                        <button id="side-panel-close" class="p-1.5 rounded-full text-slate-500 hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                </header>

                <!-- Panel Body -->
                <div class="flex-1 overflow-y-auto p-6">
                    <dl class="divide-y divide-slate-100">
                        ${detailItem('clock', '创建时间', new Date(order.createdAt).toLocaleString())}
                        ${detailItem('shield-alert', '预警状态', `<span class="status-badge status-badge-${alertInfo.level}">${alertInfo.text}</span>`)}
                        ${detailItem('flag', '状态', `<span class="status-badge ${statusBadges[order.status] || 'status-badge-gray'}">${order.status}</span>`)}
                        ${detailItem('sliders-horizontal', '进度', `
                            <div class="flex items-center gap-3">
                                <input type="range" min="0" max="100" value="${order.progress}" class="w-full progress-slider-panel" data-order-id="${order.orderId}" style="--progress-percent: ${order.progress}%">
                                <span class="font-bold text-indigo-600 w-12 text-center progress-value-panel">${order.progress}%</span>
                            </div>
                        `)}
                        ${detailItem('arrow-up-circle', '优先级', `<span class="status-badge ${priorityBadges[order.priority] || 'status-badge-gray'}">${order.priority}</span>`)}
                        ${detailItem('calendar', '开始时间', order.startDate)}
                        ${detailItem('tags', '标签', `<span class="status-badge status-badge-blue">${order.productCategory}</span><span class="status-badge status-badge-gray">${order.type}</span>`)}
                        ${detailItem('users', '负责人', `<div class="flex items-center -space-x-2">${assignees.map(u => Helpers.getAvatar(u)).join('') || '<span>-</span>'}</div>`)}
                    </dl>

                    <div class="mt-6">
                        <h3 class="text-sm font-semibold text-slate-800 mb-2">项目描述</h3>
                        <p class="text-sm text-slate-600">${order.description}</p>
                    </div>
                    
                    <div class="mt-8">
                        <h3 class="text-sm font-semibold text-slate-800 mb-4">动态</h3>
                        <div class="space-y-6">
                            ${activities.map(renderActivity).join('') || '<p class="text-sm text-slate-500">暂无动态</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const sidePanel = document.getElementById('side-panel');
        sidePanel.innerHTML = panelContent;
        lucide.createIcons();

        // --- Event Listeners for the new panel ---
        const progressSlider = sidePanel.querySelector('.progress-slider-panel');
        const progressValue = sidePanel.querySelector('.progress-value-panel');

        if (progressSlider && progressValue) {
            const initialProgress = order.progress; // Store initial progress

            progressSlider.addEventListener('input', (e) => {
                const percent = e.target.value;
                progressValue.textContent = `${percent}%`;
                e.target.style.setProperty('--progress-percent', `${percent}%`);
            });

            progressSlider.addEventListener('change', (e) => {
                const newProgress = parseInt(e.target.value);
                // Open a modal to get a comment for the progress update
                UI.renderUpdateProgressCommentModal(orderId, initialProgress, newProgress);
            });
        }

        this.showSidePanel();
    },
    showSidePanel() {
        const overlay = document.getElementById('side-panel-overlay');
        const panel = document.getElementById('side-panel');
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            panel.classList.add('open');
        });
    },
    hideSidePanel() {
        const overlay = document.getElementById('side-panel-overlay');
        const panel = document.getElementById('side-panel');
        overlay.classList.remove('visible');
        panel.classList.remove('open');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
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
        const client = AppState.clients[clientId];
        const content = `
            <form id="add-follow-up-form" data-client-id="${clientId}">
                <div>
                    <label for="follow-up-type" class="block text-sm font-medium text-slate-700 mb-2">跟进类型</label>
                    <select id="follow-up-type" name="type" class="form-select w-full">
                        <option value="call">电话</option>
                        <option value="visit">上门拜访</option>
                        <option value="online">线上会议</option>
                        <option value="email">邮件</option>
                    </select>
                </div>
                <div class="mt-4">
                    <label for="follow-up-notes" class="block text-sm font-medium text-slate-700 mb-2">跟进内容</label>
                    <textarea id="follow-up-notes" name="notes" rows="4" class="form-textarea w-full"></textarea>
                </div>
                <div class="mt-6 flex justify-end gap-3">
                    <button type="button" class="modal-close-btn px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">取消</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">添加跟进</button>
                </div>
            </form>
        `;
        this.showModal(`添加跟进 - ${client.name}`, content, 'max-w-lg');
    },
    renderEditProfileModal() {
        const content = `
            <form id="edit-profile-form">
                <div>
                    <h3 class="text-lg font-medium text-slate-800">个人信息</h3>
                    <p class="text-slate-500 text-sm mt-1">修改您的个人资料和设置</p>
                </div>

                <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="username" class="block text-sm font-medium text-slate-700 mb-1">用户名</label>
                        <input type="text" id="username" class="form-input w-full" value="${AppState.currentUser.name}" readonly>
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-slate-700 mb-1">电子邮件</label>
                        <input type="email" id="email" class="form-input w-full" value="${AppState.currentUser.email}">
                    </div>
                    <div>
                        <label for="phone" class="block text-sm font-medium text-slate-700 mb-1">手机号</label>
                        <input type="tel" id="phone" class="form-input w-full" value="13900001234">
                    </div>
                    <div>
                        <label for="position" class="block text-sm font-medium text-slate-700 mb-1">职位</label>
                        <input type="text" id="position" class="form-input w-full" value="${AppState.currentUser.role.replace('_', ' ')}" readonly>
                    </div>
                </div>

                <div class="mt-6">
                    <label for="bio" class="block text-sm font-medium text-slate-700 mb-1">个人简介</label>
                    <textarea id="bio" rows="4" class="form-textarea w-full">专注于用户体验和界面设计的产品开发人员，有5年相关工作经验。</textarea>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                    <button type="button" class="modal-close-btn px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">取消</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">保存修改</button>
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
        const { users, departments } = AppState;
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
        const { users, work_orders, clients, filters } = AppState;

        const followUpStatusMap = {
            just_started: { text: '刚开始跟进', classes: 'bg-slate-100 text-slate-700' },
            following_up: { text: '跟进中', classes: 'bg-blue-100 text-blue-800' },
            about_to_close: { text: '即将成交', classes: 'bg-amber-100 text-amber-800' },
            closed: { text: '已成交', classes: 'bg-green-100 text-green-800' },
            customer_lost: { text: '客户流失', classes: 'bg-red-100 text-red-800' }
        };

        const customerSources = [...new Set(work_orders.map(o => o.customerSource))];

        // 过滤工单
        const filtered_orders = work_orders.filter(order => {
            const statusMatch = filters.status.length === 0 || filters.status.includes(order.followUpStatus);
            const sourceMatch = filters.source.length === 0 || filters.source.includes(order.customerSource);
            return statusMatch && sourceMatch;
        });

        // We'll treat work orders as "tickets" for this view, similar to the UI mock.
        const tickets = filtered_orders.map(order => ({
            id: order.orderId,
            name: order.orderName,
            createdAt: order.createdAt,
            assignedTo: users[order.leadId] || { name: '未分配', initials: '?' },
            priority: order.priority,
            status: order.progress,
            client: clients[order.clientId],
            productCategory: order.productCategory,
            customerSource: order.customerSource,
            customerSize: order.customerSize,
            followUpStatus: order.followUpStatus,
        }));

        const stats = {
            tagAccuracy: 87.2,
            openTickets: tickets.filter(t => t.status < 100).length,
            criticalIssues: tickets.filter(t => t.priority === 'High' && t.status < 100).length,
            inDevelopment: tickets.filter(t => t.status > 0 && t.status < 100).length
        };

        container.innerHTML = `
            <div class="flex flex-col h-full bg-slate-50 p-0">
                <div class="flex-shrink-0 bg-slate-50 pt-1 px-0">
                    <div class="flex flex-col mb-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-4">
                            <div class="bg-white p-5 rounded-xl shadow-sm border">
                                <p class="text-sm text-slate-500 mb-1">客户数量（每月）</p>
                                <div class="flex items-baseline gap-2">
                                    <p class="text-3xl font-bold text-slate-800">127</p>
                                    <p class="text-sm font-semibold text-red-500 flex items-center"><i data-lucide="arrow-up" class="w-4 h-4"></i>12.5%</p>
                                </div>
                            </div>
                            <div class="bg-white p-5 rounded-xl shadow-sm border">
                                <p class="text-sm text-slate-500 mb-1">成交量（每月）</p>
                                <div class="flex items-baseline gap-2">
                                    <p class="text-3xl font-bold text-slate-800">42</p>
                                    <p class="text-sm font-semibold text-red-500 flex items-center"><i data-lucide="arrow-up" class="w-4 h-4"></i>8.4%</p>
                                </div>
                            </div>
                            <div class="bg-white p-5 rounded-xl shadow-sm border">
                                <p class="text-sm text-slate-500 mb-1">转化率（每月）</p>
                                <div class="flex items-baseline gap-2">
                                    <p class="text-3xl font-bold text-slate-800">33.1%</p>
                                    <p class="text-sm font-semibold text-green-500 flex items-center"><i data-lucide="arrow-down" class="w-4 h-4"></i>2.3%</p>
                                </div>
                            </div>
                            <div class="bg-white p-5 rounded-xl shadow-sm border">
                                <p class="text-sm text-slate-500 mb-1">平均成交周期（每月）</p>
                                <div class="flex items-baseline gap-2">
                                    <p class="text-3xl font-bold text-slate-800">21天</p>
                                    <p class="text-sm font-semibold text-green-500 flex items-center"><i data-lucide="arrow-down" class="w-4 h-4"></i>3天</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex-grow flex gap-6 overflow-hidden p-0">
                    <div class="flex-grow flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div class="p-4 border-b border-slate-200">
                             <div class="flex justify-between items-center">
                                <div class="relative w-full max-w-xs">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-lucide="search" class="w-5 h-5 text-slate-400"></i>
                                    </div>
                                    <input type="text" placeholder="Search anything..." class="form-input pl-10 w-full bg-slate-50 border-slate-200">
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="relative">
                                        <button id="filter-btn" class="bg-white border border-slate-300 text-slate-700 font-medium py-2 px-3 rounded-lg flex items-center gap-2 transition-colors hover:bg-slate-50">
                                            <i data-lucide="filter" class="w-4 h-4"></i> Filters
                                        </button>
                                        <div id="filter-dropdown" class="hidden absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-20 border">
                                            <div class="p-4">
                                                <h4 class="text-sm font-semibold text-slate-800 mb-3">按状态过滤</h4>
                                                <div class="grid grid-cols-2 gap-2">
                                                    ${Object.entries(followUpStatusMap).map(([key, {text}]) => `
                                                        <div>
                                                            <label class="flex items-center space-x-2 text-sm">
                                                                <input type="checkbox" data-filter-type="status" value="${key}" class="form-checkbox h-4 w-4 rounded text-indigo-600" ${filters.status.includes(key) ? 'checked' : ''}>
                                                                <span>${text}</span>
                                                            </label>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            </div>
                                            <div class="p-4 border-t border-slate-200">
                                                <h4 class="text-sm font-semibold text-slate-800 mb-3">按客户来源过滤</h4>
                                                <div class="grid grid-cols-2 gap-2">
                                                     ${customerSources.map(source => `
                                                        <div>
                                                            <label class="flex items-center space-x-2 text-sm">
                                                                <input type="checkbox" data-filter-type="source" value="${source}" class="form-checkbox h-4 w-4 rounded text-indigo-600" ${filters.source.includes(source) ? 'checked' : ''}>
                                                                <span>${source}</span>
                                                            </label>
                                                        </div>
                                                     `).join('')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex-grow overflow-y-auto">
                            <table class="min-w-full">
                                <thead class="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th class="p-4 w-10"><input type="checkbox" class="form-checkbox rounded text-indigo-600"></th>
                                        <th class="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户名称</th>
                                        <th class="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">创建时间</th>
                                        <th class="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户来源</th>
                                        <th class="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">产品类型</th>
                                        <th class="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户规模</th>
                                        <th class="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                                        <th class="p-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-slate-200">
                                    ${tickets.map((ticket) => {
                                        const statusInfo = followUpStatusMap[ticket.followUpStatus] || followUpStatusMap['just_started'];
                                        return `
                                        <tr data-ticket-id="${ticket.id}" class="hover:bg-slate-50 cursor-pointer ticket-row">
                                            <td class="p-4"><input type="checkbox" class="form-checkbox rounded text-indigo-600"></td>
                                            <td class="p-4 text-sm font-semibold text-slate-700">${ticket.name}</td>
                                            <td class="p-4 text-sm text-slate-500">${new Date(ticket.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td class="p-4 text-sm text-slate-500">
                                                <span class="px-3 py-1 text-xs font-semibold rounded-full ${ticket.customerSource === '线上' ? 'bg-blue-100 text-blue-800' : ticket.customerSource === '线下' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}">
                                                    ${ticket.customerSource || '未知'}
                                                </span>
                                            </td>
                                            <td class="p-4">
                                                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                                                    ${ticket.productCategory || '未分类'}
                                                </span>
                                            </td>
                                            <td class="p-4 text-sm text-slate-600">
                                                <span class="px-3 py-1 text-xs font-semibold rounded-full ${ticket.customerSize === '大' ? 'bg-emerald-100 text-emerald-800' : ticket.customerSize === '中' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}">
                                                    ${ticket.customerSize || '未知'}
                                                </span>
                                            </td>
                                            <td class="p-4">
                                                <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.classes}">
                                                    ${statusInfo.text}
                                                </span>
                                            </td>
                                            <td class="p-4 text-slate-500">
                                                <div class="flex items-center gap-2">
                                                    <button class="follow-up-btn p-1 rounded hover:bg-slate-100" data-ticket-id="${ticket.id}" title="添加跟进记录">
                                                        <i data-lucide="message-circle" class="w-5 h-5 text-indigo-500"></i>
                                                    </button>
                                                    <button class="p-1 rounded hover:bg-slate-100">
                                                        <i data-lucide="more-horizontal" class="w-5 h-5"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div class="p-4 border-t border-slate-200 text-sm text-slate-600 flex justify-between items-center">
                            <span>显示 ${tickets.length} / 共 ${work_orders.length} 条数据</span>
                            <div class="flex items-center gap-2">
                                <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                                </button>
                                <button class="w-8 h-8 flex items-center justify-center rounded border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700">1</button>
                                <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">2</button>
                                <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">3</button>
                                <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">...</button>
                                <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">23</button>
                                <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
                                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="ticket-details-panel" class="w-full max-w-md flex-shrink-0">
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        
        // 如果有工单，默认选中第一个并显示详情
        if (tickets && tickets.length > 0) {
            // 选择第一行
            const firstTicketRow = container.querySelector('.ticket-row');
            if (firstTicketRow) {
                firstTicketRow.classList.add('bg-indigo-50');
                // 显示详情
                this.renderTicketDetailsPanel(tickets[0].id);
            }
        }
    },

    renderTicketDetailsPanel(ticketId) {
        const panel = document.getElementById('ticket-details-panel');
        if(!panel) return;

        const ticket = AppState.work_orders.find(o => o.orderId === ticketId);
        if (!ticket) {
            panel.innerHTML = '';
            return;
        };

        const assignedUser = AppState.users[ticket.leadId] || { name: 'Unassigned', email: '' };
        const activities = AppState.activities.filter(a => a.orderId === ticketId).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        const client = ticket.clientId ? AppState.clients[ticket.clientId] : null;
        
        panel.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border h-full flex flex-col">
                <div class="p-4 border-b border-slate-200">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-slate-500">#${ticket.orderId.replace('order_','')}</p>
                            <h2 class="text-lg font-bold text-slate-800 mt-1">${ticket.orderName}</h2>
                        </div>
                    </div>
                </div>
                
                <div class="flex-grow overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h3>
                        <div class="space-y-4">
                            <div class="bg-slate-50 p-3 rounded-lg">
                                <div class="text-sm">
                                    <div class="font-semibold text-slate-700 mb-1">联系人信息</div>
                                    <div>联系人：${client ? client.contactName : '未知'}</div>
                                    <div>电话：${client ? client.contactPhone : '未知'}</div>
                                </div>
                            </div>

                            ${activities.length > 0 ? activities.map(act => `
                                <div class="flex gap-3">
                                    <div>${Helpers.getAvatar(AppState.users[act.userId])}</div>
                                    <div class="text-sm flex-grow">
                                        <div class="bg-slate-50 p-3 rounded-lg">
                                            <p class="font-semibold text-slate-700">${AppState.users[act.userId].name} commented</p>
                                            <p class="text-slate-600 mt-1">${act.content}</p>
                                        </div>
                                        <p class="text-xs text-slate-400 mt-1">${new Date(act.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            `).join('') : '<p class="text-sm text-slate-500">No recent activity.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    renderEmployeeManagement(container) {
        const { users, departments, positions } = AppState;
        const containerId = 'employee-management-container';
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
    renderUpdateProgressCommentModal(orderId, oldProgress, newProgress) {
        const content = `
            <form id="update-progress-comment-form" data-order-id="${orderId}" data-old-progress="${oldProgress}" data-new-progress="${newProgress}">
                <div class="space-y-4">
                    <p class="text-sm">您正在将进度从 <strong>${oldProgress}%</strong> 更新至 <strong>${newProgress}%</strong>。</p>
                    <div>
                        <label for="progress-comment" class="block text-sm font-medium text-slate-700 mb-1">请填写更新说明 (例如：完成了什么工作)</label>
                        <textarea id="progress-comment" required class="w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300" placeholder="例如：完成了线框图初稿..."></textarea>
                    </div>
                </div>
                 <div class="mt-8 flex justify-end gap-3">
                    <button type="button" class="bg-white py-2 px-4 rounded-lg text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50" id="cancel-progress-update">取消</button>
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">确认更新</button>
                </div>
            </form>
        `;
        this.showModal('更新进度说明', content, 'max-w-lg');

        // Add event listener for cancel button
        document.getElementById('cancel-progress-update').addEventListener('click', () => {
            // Find the slider in the side panel and reset it
            const slider = document.querySelector(`.progress-slider-panel[data-order-id="${orderId}"]`);
            if (slider) {
                const valueDisplay = slider.parentElement.querySelector('.progress-value-panel');
                slider.value = oldProgress;
                slider.style.setProperty('--progress-percent', `${oldProgress}%`);
                if(valueDisplay) valueDisplay.textContent = `${oldProgress}%`;
            }
            this.hideModal();
        });
    },
    toggleDesktopSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const button = document.getElementById('desktop-sidebar-toggle');
        if (!sidebar || !mainContent || !button) return;
    
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('collapsed');
    
        if (sidebar.classList.contains('collapsed')) {
            button.innerHTML = `<i data-lucide="panel-right-close" class="w-6 h-6"></i>`;
        } else {
            button.innerHTML = `<i data-lucide="panel-left-close" class="w-6 h-6"></i>`;
        }
        lucide.createIcons();
    },
    renderFollowUpRecordModal(ticketId) {
        const ticket = AppState.work_orders.find(o => o.orderId === ticketId);
        if (!ticket) return;

        const client = AppState.clients[ticket.clientId] || { name: '未知客户' };
        const currentStatus = ticket.followUpStatus || 'just_started';
        const statusOptions = [
            { value: 'just_started', text: '刚开始跟进' },
            { value: 'following_up', text: '跟进中' },
            { value: 'about_to_close', text: '即将成交' },
            { value: 'closed', text: '已成交' },
            { value: 'customer_lost', text: '客户流失' }
        ];
        
        const followUpStatusMap = {
            just_started: { text: '刚开始跟进', classes: 'bg-slate-100 text-slate-700' },
            following_up: { text: '跟进中', classes: 'bg-blue-100 text-blue-800' },
            about_to_close: { text: '即将成交', classes: 'bg-amber-100 text-amber-800' },
            closed: { text: '已成交', classes: 'bg-green-100 text-green-800' },
            customer_lost: { text: '客户流失', classes: 'bg-red-100 text-red-800' }
        };
        const statusInfo = followUpStatusMap[currentStatus];

        // 获取当前本地时间
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

        const content = `
            <form id="follow-up-record-form" data-ticket-id="${ticketId}">
                <div class="space-y-5">
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <div class="text-lg font-medium text-slate-800">${client.name}</div>
                            <div class="text-sm text-slate-500">${ticket.orderName}</div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="follow-up-status" class="block text-sm font-medium text-slate-700">跟进状态</label>
                        <select id="follow-up-status" name="follow-up-status" 
                            class="form-select block w-full mt-1 rounded-md">
                            ${statusOptions.map(option => 
                                `<option value="${option.value}" ${currentStatus === option.value ? 'selected' : ''}>${option.text}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label for="follow-up-time" class="block text-sm font-medium text-slate-700">跟进时间</label>
                        <input type="datetime-local" id="follow-up-time" name="follow-up-time" value="${currentDateTime}"
                            class="form-input block w-full mt-1 rounded-md">
                    </div>

                    <div class="space-y-2">
                        <label for="follow-up-content" class="block text-sm font-medium text-slate-700">跟进内容</label>
                        <textarea id="follow-up-content" name="follow-up-content" rows="4"
                            class="form-textarea block w-full mt-1 rounded-md"
                            placeholder="请输入跟进记录内容..."></textarea>
                    </div>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                    <button type="button" id="cancel-follow-up" class="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">取消</button>
                    <button type="submit" id="submit-follow-up" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">保存记录</button>
                </div>
            </form>
        `;

        this.showModal('添加跟进记录', content);

        document.getElementById('cancel-follow-up').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('follow-up-record-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const statusValue = document.getElementById('follow-up-status').value;
            const timeValue = document.getElementById('follow-up-time').value;
            const contentValue = document.getElementById('follow-up-content').value;

            if (!contentValue.trim()) {
                alert('请输入跟进内容');
                return;
            }

            // 更新工单状态
            const order = AppState.work_orders.find(o => o.orderId === ticketId);
            if (order) {
                order.followUpStatus = statusValue;
                
                // 创建活动记录
                const statusText = statusOptions.find(option => option.value === statusValue).text;
                const formattedTime = new Date(timeValue).toLocaleString('zh-CN');
                const activityContent = `将状态更新为 <strong>${statusText}</strong>：${contentValue}`;
                
                App.addActivity(ticketId, AppState.currentUser.userId, 'FOLLOW_UP', activityContent, {
                    status: statusValue,
                    content: contentValue,
                    timestamp: new Date(timeValue)
                });

                // 重新渲染
                UI.renderClientFollowUps(document.getElementById('app'));
                this.hideModal();
            }
        });
    },
    
    // 渲染销售订单看板
    renderOrderBoard(container) {
        const orderId = AppState.selectedOrderId;
        if (!orderId) {
            container.innerHTML = '<div class="p-6 text-center text-slate-500">未找到订单信息</div>';
            return;
        }
        
        const order = AppState.work_orders.find(o => o.orderId === orderId);
        if (!order) {
            container.innerHTML = '<div class="p-6 text-center text-slate-500">未找到订单信息</div>';
            return;
        }
        
        const client = AppState.clients[order.clientId];
        const tasks = AppState.tasks.filter(t => t.orderId === orderId);
        const activities = AppState.activities ? AppState.activities.filter(a => a.orderId === orderId) : [];
        
        // 计算提点
        const commissionRate = 0.05; // 5%的提点率
        const commission = Math.round(order.contractAmount * commissionRate);
        
        // 已付金额
        const paymentStatus = order.finalPaymentStatus;
        const paidAmount = paymentStatus === '已结算' ? order.contractAmount : Math.round(order.contractAmount * 0.7);
        
        // 模拟数据：详情页套数、视频套数、图片张数、工作流个数
        const detailPageCount = 3;
        const videoCount = 1;
        const imageCount = 12;
        const workflowCount = 2;
        
        // 模拟数据：待开始、已完成、黄色预警和红色预警
        const pendingCount = 0;
        const completedCount = 4;
        const yellowAlertCount = 1;
        const redAlertCount = 0;
        
        container.innerHTML = `
            <div class="mb-6">
                <h1 class="text-xl font-bold text-slate-800">工单详情：${order.orderName}</h1>
            </div>
            
            <div class="mb-6">
                <button id="back-to-sales-dashboard" class="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    <span>返回销售看板</span>
                </button>
            </div>
            
            <!-- 状态卡片 -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <!-- 待开始 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border">
                    <p class="text-sm text-slate-500 mb-1">待开始</p>
                    <p class="text-3xl font-bold text-slate-800">${pendingCount}</p>
                    <div class="mt-2 text-xs text-slate-600">
                        <div>详情页：${detailPageCount}套</div>
                        <div>视频：${videoCount}套</div>
                        <div>图片：${imageCount}张</div>
                        <div>工作流：${workflowCount}个</div>
                    </div>
                </div>
                
                <!-- 已完成 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border">
                    <p class="text-sm text-slate-500 mb-1">已完成</p>
                    <p class="text-3xl font-bold text-slate-800">${completedCount}</p>
                </div>
                
                <!-- 黄色预警 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border">
                    <p class="text-sm text-slate-500 mb-1">黄色预警</p>
                    <p class="text-3xl font-bold text-yellow-500">${yellowAlertCount}</p>
                </div>
                
                <!-- 红色预警 -->
                <div class="bg-white p-5 rounded-xl shadow-sm border">
                    <p class="text-sm text-slate-500 mb-1">红色预警</p>
                    <p class="text-3xl font-bold text-red-500">${redAlertCount}</p>
                </div>
            </div>
            
            <!-- 工单详情面板 -->
            <div class="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <div class="mb-6">
                    <h2 class="text-xl font-bold text-slate-800">${order.orderName}</h2>
                    <p class="text-slate-500 mt-1">客户：${client.name}</p>
                    <div class="mt-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                        ${order.status === 'completed' ? '已完成' : order.status === 'in_progress' ? '进行中' : '待处理'}
                    </div>
                </div>
                
                <!-- 财务信息 -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-500">合同金额</span>
                        <span class="text-xl font-semibold text-slate-800">¥${order.contractAmount.toLocaleString()}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-500">已付金额</span>
                        <span class="text-xl font-semibold text-slate-800">¥${paidAmount.toLocaleString()}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-500">提点金额</span>
                        <span class="text-xl font-semibold text-green-600">¥${commission.toLocaleString()}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-500">接入日期</span>
                        <span class="text-xl font-semibold text-slate-800">${new Date(order.startDate).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <!-- 工单进度 -->
                <div class="mb-6">
                    <h3 class="font-semibold text-slate-700 mb-2">工单进度</h3>
                    <div class="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                        <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${order.progress}%"></div>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-500">当前进度：${order.progress}%</span>
                        <span class="text-slate-500">预计完成时间：${new Date(order.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <!-- 工单说明 -->
                <div>
                    <h3 class="font-semibold text-slate-700 mb-3">工单说明</h3>
                    <p class="text-slate-600 bg-slate-50 p-4 rounded-lg">${order.description || '设计制作春季新款夹克的电商详情页，包含模特图、细节图和尺码表。'}</p>
                </div>
            </div>
            
            <!-- 任务列表和活动记录 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 任务列表 -->
                <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <h3 class="p-4 text-lg font-semibold text-slate-800 border-b">任务列表</h3>
                    <table class="w-full text-left">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="p-4 text-sm font-semibold text-slate-600">任务内容</th>
                                <th class="p-4 text-sm font-semibold text-slate-600">负责人</th>
                                <th class="p-4 text-sm font-semibold text-slate-600">状态</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            ${tasks.length > 0 ? tasks.map(task => {
                                const assignee = AppState.users[task.assigneeId];
                                const statusClass = task.status === 'completed' ? 'status-badge-green' : 'status-badge-yellow';
                                const statusText = task.status === 'completed' ? '已完成' : '进行中';
                                return `
                                    <tr class="hover:bg-slate-50">
                                        <td class="p-4 font-medium text-slate-800">${task.description || '完成夹克详情页切图'}</td>
                                        <td class="p-4">
                                            ${assignee ? `
                                                <div class="flex items-center gap-2">
                                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-rose-200 text-rose-800" title="${assignee.name}">
                                                        ZS
                                                    </div>
                                                    <span class="text-slate-600">${assignee.name}</span>
                                                </div>
                                            ` : '<span class="text-slate-400">未分配</span>'}
                                        </td>
                                        <td class="p-4">
                                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">已完成</span>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr>
                                    <td class="p-4 font-medium text-slate-800">完成夹克详情页切图</td>
                                    <td class="p-4">
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-rose-200 text-rose-800">
                                                ZS
                                            </div>
                                            <span class="text-slate-600">张三</span>
                                        </div>
                                    </td>
                                    <td class="p-4">
                                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">已完成</span>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
                
                <!-- 活动记录 -->
                <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="text-lg font-semibold text-slate-800">活动记录</h3>
                        <button id="add-follow-up-btn" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            添加跟进
                        </button>
                    </div>
                    
                    <div class="p-4">
                        ${activities.length > 0 ? `
                            <div class="space-y-4 max-h-[400px] overflow-y-auto">
                                ${activities.map(activity => {
                                    const user = AppState.users[activity.userId];
                                    const time = new Date(activity.timestamp).toLocaleString();
                                    return `
                                        <div class="flex gap-3">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-rose-200 text-rose-800">
                                                ${user.initials || 'ZS'}
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex justify-between mb-1">
                                                    <div class="font-medium text-slate-800">${user.name}</div>
                                                    <div class="text-xs text-slate-500">${time}</div>
                                                </div>
                                                <div class="text-sm text-slate-600">${activity.content}</div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<div class="text-center text-slate-500 py-4">暂无活动记录</div>'}
                    </div>
                </div>
            </div>
        `;
        
        // 添加事件监听
        lucide.createIcons();
        
        // 返回销售看板按钮
        const backBtn = document.getElementById('back-to-sales-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                App.navigateTo('sales_dashboard');
            });
        }
        
        // 添加跟进按钮
        const addFollowUpBtn = document.getElementById('add-follow-up-btn');
        if (addFollowUpBtn) {
            addFollowUpBtn.addEventListener('click', () => {
                this.renderFollowUpRecordModal(orderId);
            });
        }
    },
};

// --- 事件处理和逻辑模块 ---
const App = {
    init() {
        UI.init();
        
        const loggedInRole = sessionStorage.getItem('loggedInUserRole');
        const roleSwitcher = document.getElementById('role-switcher');
        if (roleSwitcher && loggedInRole) {
            roleSwitcher.value = loggedInRole;
        }

        this.setupEventListeners();
        this.handleRoleChange();
    },

    setupEventListeners() {
        const roleSwitcher = document.getElementById('role-switcher');
        const sidebarNav = document.getElementById('sidebar-nav');
        
        if (roleSwitcher) {
            roleSwitcher.addEventListener('change', () => this.handleRoleChange());
        }
        
        if (sidebarNav) {
            sidebarNav.addEventListener('click', (e) => this.handleNavClick(e));
        }
        
        // 添加登出按钮的点击事件
        document.body.addEventListener('click', (e) => {
            const logoutBtn = e.target.closest('#logout-btn');
            if (logoutBtn) {
                // 清除会话并返回登录页面
                sessionStorage.removeItem('loggedInUserRole');
                window.location.href = 'login.html';
            }
            
            // 处理订单看板导航
            const orderBoardLink = e.target.closest('.view-order-board');
            if (orderBoardLink) {
                const orderId = orderBoardLink.dataset.orderId;
                if (orderId) {
                    this.navigateToOrderBoard(orderId);
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
    },

    handleRoleChange() {
        const roleSwitcher = document.getElementById('role-switcher');
        const role = roleSwitcher.value;
        const userMap = {
            'sales': 'user_sales_wang',
            'prod_manager': 'user_prod_zhao',
            'art_lead': 'user_art_li',
            'art_staff': 'user_art_zhang',
            'render_staff': 'user_render_sun',
            'kanban_supervisor': 'user_supervisor_zhou',
            'hr': 'user_hr_chen'
        };
        const userId = userMap[role];
        AppState.currentUser = AppState.users[userId];
        
        sessionStorage.setItem('loggedInUserRole', role);

        document.getElementById('user-info').innerHTML = `
            <div class="flex items-center gap-3">
                ${Helpers.getAvatar(AppState.currentUser)}
                <div>
                    <p class="font-semibold text-sm text-slate-800">${AppState.currentUser.name}</p>
                    <p class="text-xs text-slate-500 capitalize">${AppState.currentUser.role.replace('_', ' ')}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                 <button id="logout-btn" class="text-slate-500 hover:text-red-600" title="退出登录">
                     <i data-lucide="log-out" class="w-4 h-4"></i>
                 </button>
             </div>
        `;
        
        // 确保AppState.userRoles存在，并为不同角色设置默认页面
        if (!AppState.userRoles) {
            AppState.userRoles = {
                'sales': { defaultPage: 'client_followups' },
                'prod_manager': { defaultPage: 'dashboard' },
                'art_lead': { defaultPage: 'team' },
                'art_staff': { defaultPage: 'my_tasks' },
                'render_staff': { defaultPage: 'my_tasks' },
                'kanban_supervisor': { defaultPage: 'analysis' },
                'hr': { defaultPage: 'hr_management' }
            };
        }
        
        const defaultPage = AppState.userRoles[role]?.defaultPage || 'dashboard';
        this.navigateTo(defaultPage);
    },
    
    handleNavClick(e) {
        e.preventDefault();
        const link = e.target.closest('a[data-page]');
        if (link && link.dataset.page !== AppState.currentPage) {
            this.navigateTo(link.dataset.page);
        }
    },

    navigateTo(page) {
        AppState.currentPage = page;
        UI.renderPage();
    },
    
    // 导航到订单看板
    navigateToOrderBoard(orderId) {
        // 存储当前选中的订单ID
        AppState.selectedOrderId = orderId;
        // 导航到订单看板页面
        AppState.currentPage = 'order_board';
        // 渲染页面
        UI.renderPage();
    },
    
    addActivity(orderId, userId, activityType, content, metadata = {}) {
        // 确保活动数组已初始化
        if (!AppState.activities) {
            AppState.activities = [];
        }
        
        // 创建新的活动记录
        const activityId = `activity_${Date.now()}`;
        const newActivity = {
            activityId,
            orderId,
            userId,
            type: activityType,
            content,
            timestamp: metadata.timestamp || new Date(),
            metadata
        };
        
        // 添加到活动列表
        AppState.activities.unshift(newActivity);
        
        // 如果是工单状态变更，更新工单
        if (activityType === 'FOLLOW_UP' && metadata.status) {
            const order = AppState.work_orders.find(o => o.orderId === orderId);
            if (order) {
                order.lastActivity = new Date();
                order.lastActivityContent = content;
            }
        }
        
        return newActivity;
    }
};

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});