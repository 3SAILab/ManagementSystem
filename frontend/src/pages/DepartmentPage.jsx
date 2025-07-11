import React, { useEffect, useState } from 'react';
import { getDepartments, addDepartment, deleteDepartment } from '../services/departmentService';
import AddDepartmentModal from '../components/AddDepartmentModal';
import { toast } from 'react-toastify';

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 获取部门数据
  useEffect(() => {
    async function get() {
      try {
        const res = await getDepartments();
        if (res.success) {
          setDepartments(res.data);
        } else {
          console.error('获取部门列表失败:', res.error);
        }
      } catch (error) {
        console.error('获取部门列表失败:', error);
      }
    }

    get();
  }, []);

  // 新增部门
  const handleAdd = async (newDepartment) => {
    try {
      const res = await addDepartment(newDepartment); // 调用接口添加部门
      if (res.success) {
        setDepartments(res.data); // 更新列表
        setIsModalOpen(false);    // 关闭模态框
        toast.success('新增部门成功！');
      } else {
        alert(res.error || '新增失败，请重试');
      }
    } catch (error) {
      alert('新增失败，请重试');
      console.error('新增部门失败:', error);
    }
  };

  // 删除部门
  const handleDelete = async (department) => {
    if (!window.confirm(`确定要删除 "${department.name}" 吗？`)) return;

    try {
      await deleteDepartment(department.id);
      setDepartments((prev) =>
        prev.filter((dept) => dept.id !== department.id)
      );
      toast.success('删除部门成功！');
    } catch (error) {
      alert('删除失败，请重试');
      console.error('删除部门失败:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">部门列表</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <i data-lucide="plus" className="w-4 h-4"></i> 新增部门
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600">部门ID</th>
              <th className="p-4 text-sm font-semibold text-slate-600">部门名称</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{dept.id}</td>
                  <td className="p-4 text-slate-600">{dept.name}</td>
                  <td className="p-4 text-slate-600 text-right">
                    <button
                      onClick={() => handleDelete(dept)}
                      className="delete-department-btn text-red-500 hover:text-red-700 font-medium"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-500">
                  暂无部门数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新增部门模态框 */}
      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}