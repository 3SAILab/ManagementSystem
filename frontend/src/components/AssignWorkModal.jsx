import React, { useState, useEffect } from 'react';
import { getSubTaskById } from '../services/subTaskService';
import ModalCloseButton from './ModalCloseButton';
const AssignWorkModal = ({ id, groupMembers, onClose, onSave }) => {
  // 任务信息
  const [task, setTask] = useState({
    id: '',
    ticket_name: '',
    notes: '',
    charge_id: '',
  });

  // 初始化任务分配状态
  useEffect(() => {
    getSubTaskById(id).then((res) => {
      if (res.success) {
        setTask(res.data);
      }
    });
  }, [id]);

  // 处理下拉框变化
  const handleAssigneeChange = (taskId, assigneeId) => {
    setTask(prev => ({
      ...prev,
      charge_id: assigneeId,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
          <h3 className="text-xl font-semibold text-slate-800">{task.ticket_name || '未命名工单'}</h3>
          <p className="text-sm text-slate-500 mt-1">请选择该工单的负责人</p>
          </div>
          <ModalCloseButton onClose={onClose} />
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* 任务详情 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">任务详情</h4>
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700">
              {task.notes || '暂无备注信息'}
            </div>
          </div>

          {/* 分配负责人 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">分配给：</label>
            <select
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={task.charge_id || ''}
              onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
            >
              <option value="">请选择负责人</option>
              {groupMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer - 操作按钮 */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
            onClick={() => onSave(task)}
          >
            保存分配
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignWorkModal;