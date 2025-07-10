import api from './api'
import { useUserStore } from '../store/user';

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
  
      const data = response.data;
  
      console.log('登录成功!');
  
      // 存储 token
      //localStorage.setItem('access_token', data.token);  
      useUserStore.setState({
        user: data.employee,
        token: data.token
      });
  
      alert('登录成功！');
      return { success: true, data };
      
    } catch (err) {
      console.error('登录错误:', err.response.data.detail);
      return { success: false, error: err.response.data.detail };
    }
};