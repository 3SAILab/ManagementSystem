import React from 'react';
import { useUserStore } from '../store/user';

export default function MyTasksPage() {
  const { user } = useUserStore();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">员工管理</h2>
      {/* TODO: 在此添加员工管理表格或其他 UI */}
    </div>
  );
}
