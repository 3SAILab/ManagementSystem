import api from './api';

// 获取未分配的子任务(根据当前角色的身份获取美术任务或者渲染任务)
export const getSubTasks = async () => {
    try {
      const response = await api.get(`/sub_tasks/unassigned`);
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
};
// 获取任务详情(分配任务时显示任务描述)
export const getSubTaskById = async (id) => {
    try {
      const response = await api.get(`/sub_task/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
};
// 分配任务
export const assignSubTask = async (id, charge_id, estimated_completion_time) => {
    try {
      const response = await api.put(
        `/assign_task/${id}`,
        { charge_id, estimated_completion_time }
      );
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
};


// 获取个人任务列表
export const getPersonalTasks = async () => {
    try {
      const response = await api.get(`/personal_tasks`);
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
};


// 根据任务id获取任务详情(点击订单卡片显示有关任务详情，创建时间、预警状态、状态、进度、优先级、开始时间、标签、负责人)
export const getSubTaskDetailById = async (id) => {
    try {
      const response = await api.get(`/sub_task_detail/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
};

// 更新任务进度
export const updateSubTaskProgress = async (progressLog) => {
    try {
      const response = await api.put(`/update_progress/${progressLog.sub_task_id}`, progressLog);
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
};

// 获取团队任务列表
export const getTeamTasks = async (filters) => {
    try {
      const response = await api.get(`/team_tasks`, { params: filters });
      return { success: true, data: response.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
};
