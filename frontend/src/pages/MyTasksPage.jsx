import React from 'react';
import { useEmployeeStore } from '../store/employee';

export default function MyTasksPage() {
  const { employee } = useEmployeeStore();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">欢迎回来，{employee?.email}</h1>
      <p>这是你的任务管理页面。</p>
    </div>
  );
}
