import api from './api';

export const getMonthlyClientCount = async () => {
    try {
        const response = await api.get('/statistics/monthly-client-count');
        console.log("客户数量:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('获取每月客户数量失败:', error);
        return { success: false, error: error.message };
    }
};

export const getMonthlyClientConversionRate = async () => {
    try {
        const response = await api.get('/statistics/monthly-client-conversion-rate');
        console.log("客户转化率:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('获取每月客户转化率失败:', error);
        return { success: false, error: error.message };
    }
};

export const getMonthlyTransactionVolume = async () => {
    try {
        const response = await api.get('/statistics/monthly-transaction-volume');
        console.log("每月成交量:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('获取每月成交量失败:', error);
        return { success: false, error: error.message };
    }
};

export const getAverageTransactionCycle = async () => {
    try {
        const response = await api.get('/statistics/average-transaction-cycle');
        console.log("平均交易周期:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('获取平均交易周期失败:', error);
        return { success: false, error: error.message };
    }
};
