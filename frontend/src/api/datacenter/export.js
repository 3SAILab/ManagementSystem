import api from '../index';
import Qs from 'qs';
import DateUtils from '../../utils/dateUtils';
/**
 * 导出客户数据为Excel文件
 * @param {Object} filters - 过滤条件
 * @param {string} filters.name - 客户姓名/联系人/电话
 * @param {Array} filters.status - 客户状态列表
 * @param {string} filters.sales_name - 销售姓名
 * @param {Array} filters.source - 客户来源列表
 * @param {string} filters.startTime - 开始时间
 * @param {string} filters.endTime - 结束时间
 * @returns {Promise<Object>} 返回下载结果
 */
export const exportClients = async (filters = {}) => {
    try {
        const response = await api.get('/export/client', {
            params: filters,
            paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' }),
            responseType: 'blob' // 重要：设置响应类型为blob以处理文件下载
        });

        // 创建下载链接
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // 在前端生成文件名
        const timestamp = DateUtils.formatDateTime(new Date());
        const filename = `客户列表_导出_${timestamp}.xlsx`;
                
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: '导出成功' };
    } catch (error) {
        console.error('导出失败:', error);
        return { 
            success: false, 
            error: error.response?.data?.message || error.message || '导出失败' 
        };
    }
};

/**
 * 导出线上客户数据（营销管理部专用）
 * @param {Object} filters - 过滤条件
 * @returns {Promise<Object>} 返回下载结果
 */
export const exportOnlineClients = async (filters = {}) => {
    // 线上客户导出实际上就是调用客户导出接口，但会自动过滤来源为"线上"
    filters.source = ['线上'];
    return await exportClients(filters);
};
