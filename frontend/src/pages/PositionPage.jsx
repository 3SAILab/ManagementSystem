import React, { useState, useEffect } from 'react';
import AddPositionModal from '../components/AddPositonModal';
import { getPositions, addPosition, deletePosition } from '../services/positionService'; 
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';

const PositionPage = () => {
  const [positions, setPositions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPositions(); // 获取职位和部门数据

        if (res.success) {
          setPositions(res.data);
        } else {
          console.error('获取职位列表失败:', res.error);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, []);

  const handleAdd = async (position) => {
    try {
      const result = await addPosition(position);
      if (result.success) {
        setPositions(result.data);
        setIsModalOpen(false); 
        toast.success('新增职位成功！');
      }else{
        toast.error(result.error);
      }
    } catch (error) {
      console.error('新增职位失败:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!(await Swal.fire({
        text: `确定要删除该职位吗？`,
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })).isConfirmed) return;
      const result = await deletePosition(id);
      if (result.success) {
        setPositions(result.data);
        toast.success('删除职位成功！');
      }
    } catch (error) {
      console.error('删除职位失败:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">职位列表</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4"></Plus> 新增职位
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600">职位ID</th>
              <th className="p-4 text-sm font-semibold text-slate-600">职位名称</th>
              <th className="p-4 text-sm font-semibold text-slate-600">所属部门</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {positions.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-500">
                  暂无职位数据
                </td>
              </tr>
            ) : (
              positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{pos.id}</td>
                  <td className="p-4 text-slate-600">{pos.name}</td>
                  <td className="p-4 text-slate-600">
                    {pos?.department_name || '未分配'}
                  </td>
                  <td className="p-4 text-slate-600 text-right">
                    <button
                      className="delete-position-btn text-red-500 hover:text-red-700 font-medium"
                      onClick={() => handleDelete(pos.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddPositionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
};

export default PositionPage;