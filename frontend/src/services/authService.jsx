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
      console.error('登录错误:', detail);
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
    console.error('登出错误:', err);
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
    console.log("员工权限信息", response.data);
    return { success: true};
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error('获取员工信息失败:', detail);
    return { success: false, error: detail };
  }
};

//获取员工列表
export const getEmployeeList = async () => {
  try {
    const response = await api.get('/employee/list');
    console.log('员工列表：',response.data)
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error('获取员工列表失败:', detail);
    return { success: false, error: detail };
  }
};

//根据id获取员工信息
export const getEmployeeById = async (id) => {
  try {
    const response = await api.get(`/employee/${id}`);
    console.log('员工信息：',response.data)
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error('获取员工信息失败:', detail);
    return { success: false, error: detail };
  }
};

//获取上级列表
export const getManagers = async (department_id, role) => {
  try {
    const response = await api.get(`/manager/list?department_id=${department_id}&role=${role}`);
    console.log('上级列表：',response.data)
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error('获取上级列表失败:', detail);
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
    console.error('新增员工失败:', detail);
    return { success: false, error: detail };
  }
};

//修改员工工作信息
export const updateEmployeeWorkInfo = async (id, employee) => {
  try {
    const response = await api.put(`/employee/work-info/${id}`, employee);
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error('修改员工工作信息失败:', detail);
    return { success: false, error: detail };
  }
};

//获取组内成员以及工作负载
export const getGroupMembers = async () => {
  try {
    const response = await api.get(`/group/members`);
    console.log('组内成员：',response.data)
    return { success: true, data: response.data };
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error('获取组内成员失败:', detail);
    return { success: false, error: detail };
  }
};