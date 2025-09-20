import api from '../index';

// 获取客户活动日志统计数据
export const getClientActivityLogStatistics = async () => {
    try {
        const response = await api.get('/statistics/client-activity-log-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 根据销售id获取客户活动日志统计数据
export const getClientActivityLogStatisticsBySalesId = async () => {
    try {
        const response = await api.get('/statistics/client-activity-log-statistics-by-sales-id');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 获取员工本月销售统计数据
export const getMonthlySales = async () => {
    try {
        const response = await api.get('/statistics/monthly-sales');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 获取员工各月度销售提点统计数据
export const getMonthlySalesStatistics = async () => {
    try {
        const response = await api.get('/statistics/monthly-sales-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 获取员工本月各周期销售统计数据
export const getMonthlySalesByCycle = async () => {
    try {
        const response = await api.get('/statistics/monthly-sales-by-cycle');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}


// 月度销售数据
export const getSalesData = async (month) => {
    try {
        const response = await api.get(`/statistics/sales-data-statistics?month=${month}`);
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 只读销售看板 - 获取指定销售人员的本月销售统计数据
export const getReadonlyMonthlySales = async (employeeId, month) => {
    try {
        const response = await api.get(`/statistics/readonly-monthly-sales/${employeeId}`, { params: month ? { month } : {} });
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 只读销售看板 - 获取指定销售人员的本月各周期销售统计数据
export const getReadonlyMonthlySalesByCycle = async (employeeId) => {
    try {
        const response = await api.get(`/statistics/readonly-monthly-sales-by-cycle/${employeeId}`);
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 只读销售看板 - 获取指定销售人员的月度销售统计数据
export const getReadonlyMonthlySalesStatistics = async (employeeId) => {
    try {
        const response = await api.get(`/statistics/readonly-monthly-sales-statistics/${employeeId}`);
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 美工本月系数统计
export const getArtMonthlyCoefficientStatistics = async () => {
    try {
        const response = await api.get('/statistics/art-monthly-coefficient-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 本月美工平均每单完成时间
export const getArtMonthlyAverageCompletionTimeStatistics = async () => {
    try {
        const response = await api.get('/statistics/art-monthly-average-completion-time-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 渲染本月系数统计
export const getRenderMonthlyCoefficientStatistics = async () => {
    try {
        const response = await api.get('/statistics/render-monthly-coefficient-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 本月渲染平均每单完成时间
export const getRenderMonthlyAverageCompletionTimeStatistics = async () => {
    try {
        const response = await api.get('/statistics/render-monthly-average-completion-time-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 获取员工本月各周期销售额统计数据
export const getMonthlySalesAmountByCycle = async () => {
    try {
        const response = await api.get('/statistics/monthly-sales-amount-by-cycle');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};


// 获取员工月度销售额统计数据
export const getMonthlySalesAmountStatistics = async () => {
    try {
        const response = await api.get('/statistics/monthly-sales-amount-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 只读销售看板 - 获取指定销售人员的本月各周期销售额统计数据
export const getReadonlyMonthlySalesAmountByCycle = async (employeeId) => {
    try {
        const response = await api.get(`/statistics/readonly-monthly-sales-amount-by-cycle/${employeeId}`);
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 只读销售看板 - 获取指定销售人员的月度销售额统计数据
export const getReadonlyMonthlySalesAmountStatistics = async (employeeId) => {
    try {
        const response = await api.get(`/statistics/readonly-monthly-sales-amount-statistics/${employeeId}`);
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 获取线上客户数据统计数据
export const getOnlineClientDataStatistics = async () => {
    try {
        const response = await api.get('/statistics/online-client-data-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};
