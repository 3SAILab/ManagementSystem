// src/components/RequireAuth.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getEmployeePermission } from '../services/authService';


export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getEmployeePermission();
        setAuthorized(result.success);
      } catch {
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