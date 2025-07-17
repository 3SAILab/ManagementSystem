import { toast } from 'react-toastify';
import api from './api';

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