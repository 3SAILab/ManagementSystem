import api from './api';

// 查询客户列表，接收一个 filters 对象
export const getClients = async ({ name, status, source, page, page_size }) => {
    try {
        const response = await api.get('/clients', {
            params: {
                name,
                status,
                source,
                page,
                page_size
            }
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
        console.log("添加客户:", client);
        const response = await api.post('/client/add', {
            params: {
                client
            }
        });
        console.log("添加客户:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('添加客户失败:', error);
        return { success: false, error: error.message };
    }
};

//编辑客户
export const editClient = async (client) => {
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
        return {success: true, data: response.data};
    } catch (error) {
        console.error('获取客户信息失败:', error);
        return { success: false, error: error.message };
    }
};