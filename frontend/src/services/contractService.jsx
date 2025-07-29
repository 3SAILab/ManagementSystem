import api from "./api";
import Qs from 'qs';

// 添加合同
export const addContract = async (contract) => {
    try {
        const response = await api.post("/contracts", contract);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 获取个人成交合同
export const getContracts = async ({ name, status, contract_type, page, page_size }) => {
    try {
        const response = await api.get('/contracts', {
            params: { name, status, contract_type, page, page_size },
            paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' })
        });
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// 获取合同详情（美工任务，渲染任务，任务完成情况）
export const getContractDetail = async (id) => {
    try {
        const response = await api.get(`/contracts/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 更改合同状态
export const updateContractStatus = async (id, status) => {
    try {
        const payload = {
            status: status
        }
        const response = await api.put(`/contracts/${id}/status`, payload);
        return {success: true, data: response.data};
    } catch (error) {
        return {success: false, error: '合同状态更新失败'};
    }
};

// 销售主管根据客户id获取合同
export const getContractsByClientId = async (client_id) => {
    try {
        const response = await api.get(`/contracts/client/${client_id}`);
        return {success: true, data: response.data};
    } catch (error) {
        return {success: false, error: "数据加载失败"};
    }
};