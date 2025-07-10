// src/components/RequireAuth.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/user';

export default function RequireAuth() {
  const { user } = useUserStore();
  const token = useUserStore.getState().token;

  if (!token || !user) {
    console.log('没有token或用户信息，跳转到登录页面');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}