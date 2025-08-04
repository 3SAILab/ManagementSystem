import api from './api'
import { useEmployeePermissionStore } from '../store/employee';

//登录
export const login = async (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  
    try {
      const response = await api.post(
        '/token',
        params,
        { 
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true // 确保发送和接收Cookie
        }
      );
      if (response.data.success === false) {
        throw new Error('登录失败，请检查账号或密码');
      }
      
      // 不再需要手动存储token，由后端设置HttpOnly Cookie
      useEmployeePermissionStore.setState({
        employee: "",
      });
  
      return { success: true };
      
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
};

//退出登录
export const logout = async () => {
  try {
    // 调用后端登出API，清除HttpOnly Cookie
    await api.post('/logout');
    useEmployeePermissionStore.setState({
      employee: null,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
  
//获取员工权限信息
export const getEmployeePermission = async () => {
  try {
    const response = await api.get('/permission');
    useEmployeePermissionStore.setState({
      employee: response.data,
    });
    return { success: true};
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};

//获取员工列表
export const getEmployeeList = async () => {
  try {
    const response = await api.get('/employee/list');
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};

//根据id获取员工信息
export const getEmployeeById = async (id) => {
  try {
    const response = await api.get(`/employee/${id}`);
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};

//获取上级列表
export const getManagers = async (department_id, role) => {
  try {
    const response = await api.get(`/manager/list?department_id=${department_id}&role=${role}`);
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
  }
};

//新增员工
export const addEmployee = async (employee) => {
  try {
    if (employee.phone) {
      employee.phone = employee.phone;
    }
    if (employee.emergency_contact.phone) {
      employee.emergency_contact.phone = employee.emergency_contact.phone;
    }
    const response = await api.post('/register', employee);
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};

//修改员工工作信息
export const updateEmployeeWorkInfo = async (id, employee) => {
  console.log(employee)
  try {
    const response = await api.put(`/employee/work-info/${id}`, employee);
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};

//获取组内成员以及工作负载
export const getGroupMembersWithTaskCount = async () => {
  try {
    const response = await api.get(`/group/members/with_task_count`);
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};


//发送验证码
export const sendVerificationCode = async (email, purpose) => {
  try {
    const response = await api.post('/email/send-code', { email, purpose });
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};

//验证验证码
export const verifyCode = async (email, code, purpose) => {
  try {
    const response = await api.post('/email/verify-code', { email, code, purpose });
    return { success: response.data.success, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};

//重置密码
export const resetPassword = async (email, code, new_password) => {
  try {
    const response = await api.post('/email/reset-password', { email, code, new_password });
    if (response.data.success) {
      return { success: true, message: response.data.message };
    }
    return { success: false, message: response.data.message };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};

// 获取组内成员列表
export const getGroupMembers = async () => {
  try {
    const response = await api.get(`/group/members`);
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return { success: false, error: detail };
  }
};