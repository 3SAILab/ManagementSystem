import api from "./api";
import Qs from 'qs';

// 添加合同
export const addContract = async (contract) => {
    const response = await api.post("/contracts", contract);
    return response.data;
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

// 获取所有待催收尾款合同（管理端，支持筛选与分页）
export const getAllContracts = async ({ name, status, contract_type, page, page_size }) => {
    try {
        const response = await api.get('/contracts/pending', {
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
    const response = await api.get(`/contracts/${id}`);
    return response.data;
};

// 更改合同状态
export const updateContractStatus = async (id, status, settlement_time) => {
    try {
        const payload = {
            status: status,
            settlement_time: settlement_time
        }
        const response = await api.put(`/contracts/${id}/status`, payload);
        return {success: true, data: response.data};
    } catch (error) {
        return {success: false, error: `合同状态更新失败:${error.message}`};
        
    }
};

// 销售主管根据客户id获取合同
export const getContractsByClientId = async (client_id) => {
    try {
        const response = await api.get(`/contracts/client/${client_id}`);
        return {success: true, data: response.data};
    } catch (error) {
        return {success: false, error: `数据加载失败:${error.message}`};
    }
};

// 获取合同剩余需求
export const getRemainingRequirements = async (id) => {
    try {
        const response = await api.get(`/contracts/${id}/remaining_requirements`);
        if(response.data.success){
            return {success: true, data: response.data.data};
        }else{
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return {success: false,error: `数据加载失败:${error.message}`}
    }
}

// 删除合同
export const deleteContract = async (id) => {
    try {
        const response = await api.delete(`/contracts/${id}`);
        if(response.data.success){
            return {success: true, data: response.data.data};
        }else{
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        return {success: false, error: `数据加载失败:${error.message}`};
    }
}

// 只读销售看板 - 获取指定销售人员的合同列表
export const getReadonlyContracts = async (employeeId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        
        // 添加过滤参数
        if (filters.name) params.append('name', filters.name);
        if (filters.status && filters.status.length > 0) {
            filters.status.forEach(status => params.append('status', status));
        }
        if (filters.contract_type && filters.contract_type.length > 0) {
            filters.contract_type.forEach(type => params.append('contract_type', type));
        }
        if (filters.page) params.append('page', filters.page);
        if (filters.page_size) params.append('page_size', filters.page_size);
        
        const response = await api.get(`/contracts/readonly/${employeeId}?${params.toString()}`);
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.message };
    }
};

