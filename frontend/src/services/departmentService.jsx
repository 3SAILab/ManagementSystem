import api from './api'

//获取部门
export const getDepartments = async () => {
  
    try {
      const response = await api.get(
        '/api/get_departments',
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (!response.data) {
        throw new Error('获取部门失败');
      }
  
      const data = response.data;
  
      console.log('获取部门成功!');
  
      alert('获取部门成功！');
      return { success: true, data };
      
    } catch (err) {
      console.error('获取部门错误:', err.response.data.detail);
      return { success: false, error: err.response.data.detail };
    }
};
//新增部门
export const addDepartment = async (name) => {
  try {
    const response = await api.post('/api/add_departments', { name });
    return { success: true, data: response.data };
  } catch (err) {
    console.error('添加部门错误:', err.response.data.detail);
    return { success: false, error: err.response.data.detail };
  }
};

//删除部门
    export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/api/delete_department/${id}`);
    return { success: true, data: response.data };
  } catch (err) {
    console.error('删除部门错误:', err.response.data.detail);
    return { success: false, error: err.response.data.detail };
  }
};