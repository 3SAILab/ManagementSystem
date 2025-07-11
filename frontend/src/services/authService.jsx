import api from './api'
import { useEmployeeStore } from '../store/employee';

//登录
export const login = async (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  
    try {
      const response = await api.post(
        '/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
  
      if (!response.data) {
        throw new Error('登录失败，请检查账号或密码');
      }
    
      console.log('登录成功!');
      const data = response.data;
      // 存储 token
      localStorage.setItem('access_token', data.access_token);
      useEmployeeStore.setState({
        employee: "",
      });
  
      alert('登录成功！');
      return { success: true };
      
    } catch (err) {
      console.error('登录错误:', err.response.data.detail);
      return { success: false, error: err.response.data.detail };
    }
};

//退出登录
export const logout = () => {
  localStorage.removeItem('access_token');
  useEmployeeStore.setState({
    employee: null,
  });
};
  
//获取员工信息
export const getEmployeeInfo = async () => {
  try {
    const token = localStorage.getItem('access_token');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/me');
    useEmployeeStore.setState({
      employee: response.data,
    });
    return { success: true};
  } catch (err) {
    console.error('获取员工信息失败:', err.response.data.detail);
    return { success: false, error: err.response.data.detail };
  }
};