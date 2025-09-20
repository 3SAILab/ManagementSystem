import React, { useState, useEffect } from 'react';
import { getClientInfo } from '../../../../api/sales/client';
import ModalCloseButton from './ModalCloseButton';
import { getGroupMembers } from '../../../../api/auth';
import { toast } from 'react-toastify';
const CustomerSalesModal = ({ id, onClose, onSave }) => {
  //原客户负责人
  const [originalSalesId, setOriginalSalesId] = useState('');
  // 客户信息
  const [client, setClient] = useState({
    id: "",
    client_name: "",
    notes: "",
    sales_id: "",
  });
  // 组内成员列表
  const [groupMembers, setGroupMembers] = useState([]);
  // 初始化任务分配状态
  useEffect(() => {
    getClientInfo(id).then((res) => {
      if (res.success) {
        setOriginalSalesId(res.data.sales_id);
        setClient({
          id: res.data.id,
          client_name: res.data.name,
          sales_id: res.data.sales_id,
          notes: ""
        });
      }
    });
    getGroupMembers().then((res) => {
      if (res.success) {
        setGroupMembers(res.data);
      }
    });
  }, [id]);

  // 处理下拉框变化
  const handleAssigneeChange = (sales_id) => {
    setClient(prev => ({
      ...prev,
      sales_id: sales_id,
    }));
  };
  const handleNotesChange = (notes) => {
    setClient(prev => ({
      ...prev,
      notes: notes,
    }));
  };
  // 保存
  const handleSave = () => {
    if(client.sales_id === originalSalesId){
      toast.error("客户负责人未发生变化");
    }else if(client.sales_id === ''){
      toast.error("请选择负责人");
    }else{
      onSave(client);
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
          <h3 className="text-xl font-semibold text-slate-800">{client.client_name || '未命名客户'}</h3>
          <p className="text-sm text-slate-500 mt-1">请选择该客户的负责人</p>
          </div>
          <ModalCloseButton onClose={onClose} />
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* 备注 */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
              备注
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={client.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="请输入备注..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* 分配负责人 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">分配给：</label>
            <select
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={client.sales_id || ''}
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
            onClick={handleSave}
          >
            保存分配
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSalesModal;