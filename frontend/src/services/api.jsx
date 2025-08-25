import axios from 'axios';
import { useEmployeePermissionStore } from '../store/employee';
const baseURL = import.meta.env.VITE_API_URL
// 创建 Axios 实例
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 添加此配置以支持跨域Cookie
});

let navigate; // 用于延迟绑定 navigate 方法

export const setApiNavigate = (navigateFn) => {
  navigate = navigateFn;
};

// 请求拦截器
api.interceptors.request.use(config => {
  // 使用HttpOnly Cookie，不再需要手动添加令牌
  // console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
let isRefreshing = false;

api.interceptors.response.use(
  response => response,
  error => {

    if (error?.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        localStorage.removeItem('access_token');
        useEmployeePermissionStore.getState().clearEmployee(); // 清除用户状态
        if (navigate) {
          navigate('/login', { replace: true });
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;