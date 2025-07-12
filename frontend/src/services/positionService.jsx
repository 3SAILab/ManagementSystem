import api from './api';

//查询所有职位
export const getPositions = async () => {
  try {
    const response = await api.get('/get_positions');
    if (!response.data) {
        throw new Error('查询职位失败');
      }
  
      const data = response.data;
      console.log("data的内容为",data);
      return { success: true, data };
  } catch (error) {
    console.error('查询职位失败:', error);
    return { success: false, error: error.response.data.detail };
  }
};
//新增职位
export const addPosition = async (position) => {
  try {
    console.log('新增职位:', position);
    const response = await api.post(
      '/add_position',
       position 
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('新增职位失败:', error);
    return { success: false, error: error.response?.data?.detail || error.message };
  }
};
//删除职位
export const deletePosition = async (id) => {
  try {
    const response = await api.delete(
        '/delete_position', 
        { data: { id } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('删除职位失败:', error);
    return { success: false, error: error.response.data.detail };
  }
};

//根据部门id获取职位信息
export const getPositionsByDepartmentId = async (department_id) => {
  try {
    const response = await api.get(`/get_positions_by_department_id?department_id=${department_id}`);
    console.log('职位信息：',response.data)
    return { success: true, data: response.data };
  } catch (error) {
    console.error('获取职位信息失败:', error);
    return { success: false, error: error.response.data.detail };
  }
};