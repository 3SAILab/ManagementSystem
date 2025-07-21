import { toast } from 'react-toastify';
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
        console.error('获取客户活动日志统计数据失败:', error);
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
        console.error('获取客户活动日志统计数据失败:', error);
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
        console.error('获取员工本月销售统计数据失败:', error);
        return { success: false, error: error.message };
    }
};

// 获取月度销售统计数据
export const getMonthlySalesStatistics = async () => {
    try {
        const response = await api.get('/statistics/monthly-sales-statistics');
        if (response.data.success) {
            return {success: true, data: response.data.data};
        } else {
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        console.error('获取月度销售统计数据失败:', error);
        return { success: false, error: error.message };
    }
};