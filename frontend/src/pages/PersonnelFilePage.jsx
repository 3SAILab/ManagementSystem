import React from 'react';
import '../index.css';
import { useEmployeeStore } from '../store/employee';

function PersonnelFilePage() {
  const { employee } = useEmployeeStore();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">欢迎回来，{employee?.email}</h1>
      <p>这是你的人事档案页面。</p>
    </div>
  );
}

export default PersonnelFilePage;