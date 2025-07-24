import api from './api'

//获取部门
export const getDepartments = async () => {
    try {
      const response = await api.get(
        '/get_departments',
      );
  
      if (!response.data) {
        throw new Error('获取部门失败');
      }
      const data = response.data;
      return { success: true, data };
      
    } catch (error) {
      return { success: false, error: error.response.data.detail };
    }
};
//新增部门
export const addDepartment = async (name) => {
  try {
    const response = await api.post(
      '/add_departments', 
      { name }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

//删除部门
export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(
      '/delete_department', 
      { data: { id } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail};
  }
};