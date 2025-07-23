// src/components/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getEmployeePermission } from '../services/authService';


export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    console.log('RequireAuth正常运行');
    const checkAuth = async () => {
      try {
        const result = await getEmployeePermission();
        setAuthorized(result.success);
      } catch {
        console.log('未登录或令牌失效，跳转到登录页面');
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return null;
  if (!authorized) return <Navigate to="/login" replace />;
  return <Outlet />;
}