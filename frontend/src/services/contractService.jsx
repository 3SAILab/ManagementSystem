import api from "./api";
import Qs from 'qs';

// 添加合同
export const addContract = async (contract) => {
    try {
        const response = await api.post("/contracts", contract);
        return response.data;
    } catch (error) {
        console.error("添加合同失败:", error);
        throw error;
    }
};

// 获取合同
export const getContracts = async ({ name, status, contract_type, page, page_size }) => {
    try {
        const response = await api.get('/contracts', {
            params: { name, status, contract_type, page, page_size },
            paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' })
        });
        console.log("合同列表:", response.data);
        return {success: true, data: response.data};
    } catch (error) {
        console.error('获取合同列表失败:', error);
        return { success: false, error: error.message };
    }
};