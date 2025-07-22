import api from './api';

// 获取未分配的子任务(根据当前角色的身份获取美术任务或者渲染任务)
export const getSubTasks = async () => {
    try {
      const response = await api.get(`/sub_tasks/unassigned`);
      console.log('子任务：',response.data)
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      console.error('获取子任务失败:', detail);
      return { success: false, error: detail };
    }
  };
// 获取任务详情
export const getSubTaskById = async (id) => {
    try {
      const response = await api.get(`/sub_task/${id}`);
      console.log('子任务：',response.data)
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      console.error('获取子任务失败:', detail);
      return { success: false, error: detail };
    }
  };
// 分配任务
export const assignSubTask = async (id, charge_id) => {
    try {
      const response = await api.put(
        `/assign_task/${id}`,
        { charge_id }
      );
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      console.error('分配任务失败:', detail);
      return { success: false, error: detail };
    }
  };