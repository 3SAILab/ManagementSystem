import api from './api'
import { toast } from 'react-toastify';

//获取部门
export const getDepartments = async () => {
  
    const token = localStorage.getItem('access_token')
    try {
      const response = await api.get(
        '/get_departments',
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );
  
      if (!response.data) {
        throw new Error('获取部门失败');
      }
  
      const data = response.data;
  
  
      toast.success('获取部门成功！');
      return { success: true, data };
      
    } catch (err) {
      console.error('获取部门错误:', err.response.data.detail);
      return { success: false, error: err.response.data.detail };
    }
};
//新增部门
export const addDepartment = async (name) => {
  console.log('准备新增部门:', name);

  try {
    const response = await api.post('/add_departments', { name });
    return { success: true, data: response.data };
  } catch (err) {
    // 安全地处理错误信息
    let errorMessage = '未知错误';

    if (err?.response) {
      // 后端返回了错误响应（如 401、400 等）
      errorMessage = err.response.data?.detail || '请求失败';
    } else if (err?.request) {
      // 请求已发出但未收到响应
      errorMessage = '网络错误，请检查连接';
    } else {
      // 其他错误（如配置错误）
      errorMessage = err?.message || '未知错误';
    }

    console.error('添加部门失败:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

//删除部门
export const deleteDepartment = async (id) => {
  const token = localStorage.getItem('access_token')
  try {
    const response = await api.delete(
      `/delete_department/${id}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
    );
    return { success: true, data: response.data };
  } catch (err) {
    console.error('删除部门错误:', err.response.data.detail);
    return { success: false, error: err.response.data.detail };
  }
};