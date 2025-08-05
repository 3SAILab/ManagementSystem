import api from './api';

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


// 本月销售数据
export const getSalesData = async () => {
    try {
        const response = await api.get('/statistics/sales-data-statistics');
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
export const getReadonlyMonthlySales = async (employeeId) => {
    try {
        const response = await api.get(`/statistics/readonly-monthly-sales/${employeeId}`);
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
export const getMonthlyCoefficientStatistics = async () => {
    try {
        const response = await api.get('/statistics/monthly-coefficient-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};


