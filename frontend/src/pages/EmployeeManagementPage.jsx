import React from 'react';
import { useEmployeeStore } from '../store/employee';

export default function EmployeeManagementPage() {
  const { employee } = useEmployeeStore();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">员工管理</h2>
      {employee.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* TODO: 在此添加员工管理表格或其他 UI */}
        </div>
      )}
    </div>
  );
}
