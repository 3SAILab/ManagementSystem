// src/components/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getEmployeePermission } from '../services/authService';


export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    console.log('RequireAuth正常运行');
    const checkToken = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('没有token，跳转到登录页面');
        setAuthorized(false);
        setLoading(false);
        return;
      }
      try {
        const result = await getEmployeePermission();
        setAuthorized(result.success);
      } catch {
        console.log('token过期，跳转到登录页面');
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  if (loading) return null;
  if (!authorized) return <Navigate to="/login" replace />;
  return <Outlet />;
}