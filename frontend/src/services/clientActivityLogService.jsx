import api from './api';

//添加客户跟进记录
export const addClientActivityLog = async (client_activity_log) => {
    try {
        console.log(client_activity_log);
        const response = await api.post('/client_activity_log/add', client_activity_log);
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
};

//根据客户ID获取客户跟进记录
export const getClientActivityLog = async (client_id) => {
    try {
        const response = await api.get(`/client_activity_log/get/${client_id}`);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
};