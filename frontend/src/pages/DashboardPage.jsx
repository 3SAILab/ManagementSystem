import React from 'react';
import '../index.css';
import { useUserStore } from '../store/user';

function DashboardPage() {
  const { user } = useUserStore();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">欢迎回来，{user?.email}</h1>
      <p>这是你的后台仪表盘页面。</p>
    </div>
  );
}

export default DashboardPage;