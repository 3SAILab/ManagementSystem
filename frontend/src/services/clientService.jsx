import api from './api';
import Qs from 'qs';

// 查询客户列表，接收一个 filters 对象
export const getClients = async ({ name, status, source, page, page_size }) => {
    try {
        const response = await api.get('/clients', {
            params: { name, status, source, page, page_size },
            paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' })
        });
        return {success: true, data: response.data};
    } catch (error) {
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
            online_source: client.online_source,
            activity_name: client.activity_name,
            product_type: client.product_type,
            scale: client.scale,
            status: "刚开始跟进",
        }
        const response = await api.post('/client/add', payload);
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.response.data.message };
    }
};

//编辑客户
export const updateClient = async (client,clientId) => {
    try {
        // 检查clientId是否有效
        if (!clientId) {
            console.error('客户ID不能为空');
            return { success: false, error: '客户ID不能为空' };
        }
        const response = await api.put(`/client/update/${clientId}`, client);
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.response.data.message };
    }
};

//根据客户ID获取客户信息
export const getClientInfo = async (clientId) => {
    try {
        const response = await api.get(`/client/get/${clientId}`);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 更新客户状态
export const updateClientStatus = async (clientId, status) => {
    try {
        const response = await api.put(`/client/update_status/${clientId}`, { status });
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 获取客户列表包括销售名称
export const getClientsWithSalesName = async ({ name, status, source, sales_name, page, page_size }) => {
    try {
        const response = await api.get('/client/get_clients_with_sales_name', {
            params: { name, status, source, sales_name, page, page_size },
            paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' })
        });
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 修改客户负责人
export const updateClientSales = async (clientId, salesId, notes) =>{
    try {
        const response = await api.put(`/client/update_sales/${clientId}`, { sales_id: salesId, notes: notes });
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 获取线上客户列表
export const getOnlineClients = async ({ name, status, source, page, page_size }) => {
    try {
        const response = await api.get('/client/get_online_clients', {
            params: { name, status, source, page, page_size },
            paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' })
        });
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 新增线上客户
export const addOnlineClient = async (client) => {
    try {
        const payload = {
            name: client.name,
            contact_name: client.contact_name,
            contact_phone: client.contact_phone,
            source: "线上",
            online_source: client.online_source,
            activity_name: client.activity_name,
            product_type: client.product_type,
            scale: client.scale,
            address: client.address,
        }
        const response = await api.post('/client/add_online_client', {sales_id: client.sales_id, client: payload});
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.response.data.message };
    }
}

// 编辑线上客户
export const updateOnlineClient = async (clientId, client) => {
    try {
        const response = await api.put(`/client/update_online_client/${clientId}`, {sales_id: client.sales_id, client: client});
        return {success: true, data: response.data};
    } catch (error) {
        console.log(error);
        return { success: false, error: error.response.data.message };
    }
}
