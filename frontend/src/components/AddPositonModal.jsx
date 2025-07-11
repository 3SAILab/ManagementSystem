import React, { useState } from 'react';

const AddPositionModal = ({ isOpen, onClose, onAdd, departments }) => {
  const [departmentId, setDepartmentId] = useState('');
  const [positionName, setPositionName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!departmentId || !positionName.trim()) return;
    onAdd(positionName, departmentId);
    onClose(); // 关闭模态框
    setPositionName(''); // 重置表单
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">新增职位</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 所属部门 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">所属部门</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">请选择部门</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 职位名称 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">职位名称</label>
              <input
                type="text"
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
                required
                placeholder="请输入职位名称"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              确认新增
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPositionModal;