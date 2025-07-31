import React, { useState, useEffect, use } from 'react';
import { getSubTaskById } from '../services/subTaskService';
import ModalCloseButton from './ModalCloseButton';
import { toast } from 'react-toastify';
const AssignWorkModal = ({ id, groupMembers, onClose, onSave }) => {
  // 任务信息
  const [task, setTask] = useState({
    id: '',
    ticket_name: '',
    notes: '',
    detail_pages: 0,
    video_count: 0,
    image_count: 0,
    workflow_count: 0,
    priority: '高',
    platform: '国内',
  });
  // 提交信息
  const [formData, setFormData] = useState({
    id: '',
    charge_id: '',
    estimated_completion_time: '',
    difficulty_score: '',
  })
  // 初始化任务分配状态
  useEffect(() => {
    getSubTaskById(id).then((res) => {
      if (res.success) {
        setTask(res.data);
        setFormData({
          id: res.data.id,
          charge_id: res.data.charge_id,
          estimated_completion_time: res.data.estimated_completion_time,
          difficulty_score: res.data.difficulty_score,
        })
      }
    });
  }, [id]);

  // 处理下拉框变化
  const handleAssigneeChange = (charge_id) => {
    setFormData(prev => ({
      ...prev,
      charge_id: charge_id,
    }))
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
        <h3 className="text-base font-semibold text-slate-800">订单需求明细</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                详情页 (套)
              </label>
              <p className="w-full px-3 py-2 text-slate-800">
                {task.detail_pages ?? '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                视频 (套)
              </label>
              <p className="w-full px-3 py-2 text-slate-800">
                {task.video_count ?? '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                图片 (张)
              </label>
              <p className="w-full px-3 py-2 text-slate-800">
                {task.image_count ?? '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                工作流 (个)
              </label>
              <p className="w-full px-3 py-2 text-slate-800">
                {task.workflow_count ?? '-'}
              </p>
            </div>
          </div>

          {/* 优先级和平台 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                优先级
              </label>
              <p className="w-full px-3 py-2 text-slate-800">
                {task.priority || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                平台
              </label>
              <p className="w-full px-3 py-2 text-slate-800">
                {task.platform || '-'}
              </p>
            </div>
          </div>

          {/* 微信群 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              微信群
            </label>
            <p className="w-full px-3 py-2 text-slate-800">
              {task.wechat_group || '-'}
            </p>
          </div>
          {/* 任务详情 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">任务详情</h4>
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700">
              {task.notes || '暂无备注信息'}
            </div>
          </div>
          {/* 预计所需时间 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              预计所需时间 (天)<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={formData.estimated_completion_time ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                setFormData(prev => ({ ...prev, estimated_completion_time: value }));
              }}
            />
          </div>
          {/* 难度系数 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              难度系数<span className="text-red-500">*</span>
            </label>
            <input
              type="float"
              min="0"
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={formData.difficulty_score ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                setFormData(prev => ({ ...prev, difficulty_score: value }));
              }}
            />
          </div>
          {/* 分配负责人 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">分配给：</label>
            <select
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={formData.charge_id || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
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
            onClick={
              () => {
                //如果输入的不是大于0的数字不合法，提示
                if (formData.estimated_completion_time === '') {
                  toast.error('预计所需时间不能为空');
                  return;
                } else if (formData.estimated_completion_time <= 0) {
                  toast.error('预计所需时间必须大于0');
                  return;
                }
                // 负责人不能为空
                if (!formData.charge_id) {
                  toast.error('负责人不能为空');
                  return;
                }
                onSave(formData)
                onClose()
              }
            }
          >
            保存分配
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignWorkModal;