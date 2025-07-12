// src/services/api.js
import axios from 'axios';
import { useEmployeePermissionStore } from '../store/employee';

// 创建 Axios 实例
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  },
});

let navigate; // 用于延迟绑定 navigate 方法

export const setApiNavigate = (navigateFn) => {
  navigate = navigateFn;
};

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  if (token) {
    console.log('Using token:', token);
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
let isRefreshing = false;

api.interceptors.response.use(
  response => response,
  error => {
    console.log('✅ 响应拦截器被触发');

    // 打印完整错误信息便于调试
    console.error('Full error object:', error);

    if (error?.response?.status === 401) {
      console.log('❌ 检测到 401 错误，准备跳转登录页');

      if (!isRefreshing) {
        isRefreshing = true;
        console.log('准备清除token');
        localStorage.removeItem('access_token');
        console.log('准备清除用户状态');
        useEmployeePermissionStore.getState().clearEmployee(); // 清除用户状态
        console.log('navigate 函数是否存在？', typeof navigate);
        if (navigate) {
          console.log('🚀 使用 navigate 跳转到 /login');
          navigate('/login', { replace: true });
        } else {
          console.warn('⚠️ navigate 未定义，使用 window.location 跳转');
          window.location.href = '/login';
        }
      }
    } else {
      console.warn('⚠️ 非 401 错误，不处理跳转');
    }

    return Promise.reject(error);
  }
);

export default api;