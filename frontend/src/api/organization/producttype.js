import api from '../index';
import Qs from 'qs';

// 获取产品类型列表（支持分页和过滤）
export const getProductTypes = async ({ is_active, page = 1, page_size = 100 } = {}) => {
    try {
        const response = await api.get('/product-types', {
            params: { is_active, page, page_size },
            paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' })
        });
        return {success: true, data: response.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// 获取所有激活状态的产品类型（用于下拉选择）
export const getActiveProductTypes = async () => {
    try {
        const response = await api.get('/product-types/active');
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// 根据ID获取产品类型详情
export const getProductTypeById = async (id) => {
    try {
        const response = await api.get(`/product-types/${id}`);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// 创建新的产品类型（仅管理员）
export const createProductType = async (productType) => {
    try {
        const response = await api.post('/product-types', productType);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// 更新产品类型（仅管理员）
export const updateProductType = async (id, productType) => {
    try {
        const response = await api.put(`/product-types/${id}`, productType);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// 删除产品类型（软删除，仅管理员）
export const deleteProductType = async (id) => {
    try {
        const response = await api.delete(`/product-types/${id}`);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// 切换产品类型激活状态（仅管理员）
export const toggleProductTypeStatus = async (id) => {
    try {
        const response = await api.put(`/product-types/${id}/toggle`);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// 重新排序产品类型（仅管理员）
export const reorderProductTypes = async (reorderData) => {
    try {
        const response = await api.put('/product-types/reorder', reorderData);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// 批量获取产品类型
export const getProductTypesByIds = async (productTypeIds) => {
    try {
        const response = await api.post('/product-types/batch', productTypeIds);
        return {success: true, data: response.data.data};
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

