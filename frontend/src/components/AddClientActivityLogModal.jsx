import React, { useState, useEffect } from "react";
import ModalCloseButton from "./ModalCloseButton";
import { addClientActivityLog } from "../services/clientActivityLogService";
import { toast } from "react-toastify";
import AddContractModal from "./AddContractModal";
import { getClientInfo } from "../services/clientService";
import { addContract } from "../services/contractService";
import { updateClientStatus } from "../services/clientService";

const AddClientActivityLogModal = ({isOpen, clientId, onClose, onAdd }) => {
    if (!isOpen) return null;

    const [clientInfo, setClientInfo] = useState({
        name: "",
        contact_name: "",
        contact_phone: "",
        source: "",
        activity_name: "",
        product_type: "",
        scale: "",
        address: {
          province: "",
          city: "",
          district: "",
          street: "",
        },
      });
      // 获取客户信息
      useEffect(() => {
        if (clientId) {
          const fetchClientInfo = async () => {
            const response = await getClientInfo(clientId);
            setClientInfo(response.data);
            setClientActivityLog((prev) => ({
              ...prev,
              client_id: clientId,
              status: response.data.status
            }));
          };
          fetchClientInfo();
        }
      }, [clientId]);

  // 跟进记录
  const [clientActivityLog, setClientActivityLog] = useState({
    status: "刚开始跟进",
    log_time: "",
    log_content: "",
    client_id: clientId,
  });

  // 订单表单
  const [contractModal, setContractModal] = useState(false);

  // 状态映射
  // 跟进状态映射
  const followUpStatusMap = {
    '刚开始跟进': { text: '刚开始跟进', classes: 'bg-slate-100 text-slate-700' },
    '跟进中': { text: '跟进中', classes: 'bg-blue-100 text-blue-800' },
    '已成交': { text: '已成交', classes: 'bg-green-100 text-green-800' },
    '客户流失': { text: '客户流失', classes: 'bg-red-100 text-red-800' },
    '试单中': { text: '试单中', classes: 'bg-orange-100 text-orange-800' },
    '复购': { text: '复购', classes: 'bg-purple-100 text-purple-800' }
};

  // 获取当前时间（格式：YYYY-MM-DDTHH:mm）
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setClientActivityLog({ ...clientActivityLog, log_time: `${year}-${month}-${day}T${hours}:${minutes}` });
  }, []);

  // 处理合同表单提交
  const onAddContract = async (contract) => {
    let contractType = null;
    if(clientActivityLog.status === "已成交"){
      contractType = "首单";
    }else if(clientActivityLog.status === "试单中"){
      contractType = "试单";
    }else if(clientActivityLog.status === "复购"){
      contractType = "复购";
    }
    const payload = {
      client_id: clientId,
      contract_type: contractType,
      total_amount: parseFloat(contract.contractAmount),
      paid_amount: parseFloat(contract.paidAmount),
      commission_rate: parseFloat(contract.commissionRate),
      detail_pages: parseInt(contract.detailPages),
      video_count: parseInt(contract.videos),
      image_count: parseInt(contract.images),
      workflow_count: parseInt(contract.workflows),
      notes: contract.notes
    };
    const response = await addContract(payload);
    handleSaveLog();
    if (response.success) {
      toast.success("合同保存成功");
    } else {
      toast.error("合同添加失败");
    }
    onAdd();
    onClose();
  };

  // 处理客户跟进表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 判断是否需要打开订单表单
    const showOrderForm = ["已成交", "试单中", "复购"].includes(clientActivityLog.status);
    if (showOrderForm) {
        // 打开合同表单
        setContractModal(true);
    } else {
        // 无订单表单，直接保存跟进记录
        handleSaveLog();
        onAdd();
        onClose();
    }
  };

  // 合同表单关闭
  const handleCloseContractModal = () => {
    setContractModal(false);
  };

  // 保存跟进记录
  const handleSaveLog = async () => {
    const response = await addClientActivityLog(clientActivityLog);
    const res = await updateClientStatus(clientId, clientActivityLog.status);
    if (response.success && res.success) {
      toast.success("跟进记录保存成功");
    } else {
      toast.error("跟进记录添加失败");
    }
  };

  // 关闭模态框
  const handleClose = () => {
    setClientActivityLog({
      ...clientActivityLog,
      status: "刚开始跟进",
      log_content: "",
      client_id: clientId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-800">添加跟进记录</h2>
          <ModalCloseButton onClose={handleClose} />
        </div>

        <form id="follow-up-record-form" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* 客户名称与工单号 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium text-slate-800">
                  {clientInfo.name || "未知客户"}
                </div>
              </div>
            </div>

            {/* 跟进状态 */}
            <div className="space-y-2">
              <label htmlFor="follow-up-status" className="block text-sm font-medium text-slate-700">
                跟进状态
              </label>
              <select
                id="follow-up-status"
                name="follow-up-status"
                value={clientActivityLog.status}
                onChange={(e) => setClientActivityLog({ ...clientActivityLog, status: e.target.value })}
                className="form-select block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              >
                {Object.entries(followUpStatusMap).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.text}
                  </option>
                ))}
              </select>
            </div>

            {/* 跟进时间 */}
            <div className="space-y-2">
              <label htmlFor="follow-up-time" className="block text-sm font-medium text-slate-700">
                跟进时间
              </label>
              <input
                type="datetime-local"
                id="follow-up-time"
                name="follow-up-time"
                value={clientActivityLog.log_time}
                onChange={(e) => setClientActivityLog({ ...clientActivityLog, log_time: e.target.value })}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
            </div>

            {/* 跟进内容 */}
            <div className="space-y-2">
              <label htmlFor="follow-up-content" className="block text-sm font-medium text-slate-700">
                跟进内容
              </label>
              <textarea
                id="follow-up-content"
                name="follow-up-content"
                rows="4"
                value={clientActivityLog.log_content}
                onChange={(e) => setClientActivityLog({ ...clientActivityLog, log_content: e.target.value })}
                placeholder="请输入跟进记录内容..."
                className="form-textarea block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              ></textarea>
            </div>

            {/* 状态提示信息 */}
            {["已成交", "试单中", "复购"].includes(clientActivityLog.status) && (
              <div className="mt-2 text-sm text-amber-600">
                注意：保存后将需要填写订单信息
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              保存记录
            </button>
          </div>
        </form>
      </div>
      {<AddContractModal isOpen={contractModal} client={clientInfo} onClose={handleCloseContractModal} onAdd={onAddContract} />}
    </div>
  );
};

export default AddClientActivityLogModal;