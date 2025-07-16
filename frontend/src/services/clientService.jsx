import api from './api';
import Qs from 'qs';

// 查询客户列表，接收一个 filters 对象
export const getClients = async ({ name, status, source, page, page_size }) => {
    try {
        const response = await api.get('/clients', {
            params: { name, status, source, page, page_size },
            paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' })
        });
        console.log("客户列表:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('获取客户列表失败:', error);
        return { success: false, error: error.message };
    }
};

//添加客户
export const addClient = async (client) => {
    try {
        const payload = {
            name: client.name,
            contact_name: client.contact_name,
            contact_phone: client.contact_phone,
            address: client.address,
            source: client.source,
            activity_name: client.activity_name,
            product_type: client.product_type,
            scale: client.scale,
            status: "刚开始跟进",
        }
        console.log("添加客户:", payload);
        const response = await api.post('/client/add', payload);
        console.log("添加客户:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('添加客户失败:', error);
        return { success: false, error: error.message };
    }
};

//编辑客户
export const updateClient = async (client) => {
    try {
        const response = await api.put('/client/update', client);
        console.log("编辑客户:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('编辑客户失败:', error);
        return { success: false, error: error.message };
    }
};

//根据客户ID获取客户信息
export const getClientInfo = async (clientId) => {
    try {
        const response = await api.get(`/client/get/${clientId}`);
        console.log("客户信息:", response.data);
        return {success: true, data: response.data.data};
    } catch (error) {
        console.error('获取客户信息失败:', error);
        return { success: false, error: error.message };
    }
};

// 更新客户状态
export const updateClientStatus = async (clientId, status) => {
    try {
        const response = await api.put(`/client/update_status/${clientId}`, { status });
        console.log("更新客户状态:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('更新客户状态失败:', error);
        return { success: false, error: error.message };
    }
};