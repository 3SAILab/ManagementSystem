import React, { useState, useEffect } from 'react';
import { getDepartments } from '../services/departmentService';

const AddPositionModal = ({ isOpen, onClose, onAdd }) => {
  // 部门列表
  const [departments, setDepartments] = useState([]);
  // 选中的部门 ID
  const [selectedDept, setSelectedDept] = useState('');
  const [positionName, setPositionName] = useState('');

  //查询所有部门
  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await getDepartments();
      if (res.success) {
        setDepartments(res.data);
      }
    };
    fetchDepartments();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!positionName.trim()) return;
    onAdd({name: positionName, department_id: selectedDept});
    onClose(); // 关闭模态框
    setPositionName(''); // 重置表单
    setSelectedDept('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">新增职位</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 所属部门 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">所属部门</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled hidden>请选择所属部门</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
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
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              确认新增
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
            >
              取消
            </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default AddPositionModal;