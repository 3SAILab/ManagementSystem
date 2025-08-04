import React, { useState, useEffect } from "react";
import ModalCloseButton from "./ModalCloseButton";

const AddContractModal = ({ isOpen, client, onClose, onAdd }) => {
  if (!isOpen) return null;
  const [formData, setFormData] = useState({
    contractAmount: 0,
    paidAmount: 0,
    commissionRate: 0,
    detailPages: 0,
    videos: 0,
    images: 0,
    workflows: 0,
    transactionTime: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setFormData((prev) => ({ ...prev, transactionTime: `${year}-${month}-${day}T${hours}:${minutes}` }));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-800">添加合同</h2>
          <ModalCloseButton onClose={handleClose} />
        </div>
        <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息标题 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium text-slate-800">{client?.name}</div>
            </div>
          </div>

          <hr className="my-6" />

          {/* 订单金额信息 */}
          <h3 className="text-base font-semibold text-slate-800">订单金额信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="contract-amount" className="block text-sm font-medium text-slate-700">
                订单金额 (元) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="contract-amount"
                name="contractAmount"
                min="0"
                step="0.01"
                value={formData.contractAmount}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div>
              <label htmlFor="paid-amount" className="block text-sm font-medium text-slate-700">
                已付金额 (元) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="paid-amount"
                name="paidAmount"
                min="0"
                step="0.01"
                value={formData.paidAmount}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div>
              <label htmlFor="commission-rate" className="block text-sm font-medium text-slate-700">
                提点 (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="commission-rate"
                name="commissionRate"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              />
            </div>
          </div>

          <hr className="my-6" />

          {/* 订单需求明细 */}
          <h3 className="text-base font-semibold text-slate-800">订单需求明细</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="detail-pages" className="block text-sm font-medium text-slate-700">
                详情页 (套)
              </label>
              <input
                type="number"
                id="detail-pages"
                name="detailPages"
                min="0"
                step="1"
                value={formData.detailPages}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
            </div>
            <div>
              <label htmlFor="videos" className="block text-sm font-medium text-slate-700">
                视频 (套)
              </label>
              <input
                type="number"
                id="videos"
                name="videos"
                min="0"
                step="1"
                value={formData.videos}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-slate-700">
                图片 (张)
              </label>
              <input
                type="number"
                id="images"
                name="images"
                min="0"
                step="1"
                value={formData.images}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
            </div>
            <div>
              <label htmlFor="workflows" className="block text-sm font-medium text-slate-700">
                工作流 (个)
              </label>
              <input
                type="number"
                id="workflows"
                name="workflows"
                min="0"
                step="1"
                value={formData.workflows}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
            </div>
          </div>
          <hr className="my-6" />
          {/* 成交时间 */}
          <div className="space-y-2">
              <label htmlFor="transaction-time" className="block text-sm font-medium text-slate-700">
                成交时间
              </label>
              <input
                type="datetime-local"
                id="transaction-time"
                name="transactionTime"
                value={formData.transactionTime}
                onChange={(e) => setFormData({ ...formData, transactionTime: e.target.value })}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
          </div>
          {/* 提交按钮 */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              id="cancel-order-form"
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
              onClick={handleClose}
            >
              取消
            </button>
            <button
              type="submit"
              id="submit-order-form"
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              保存订单
            </button>
          </div>
        </form>
        
      </div>
      
    </div>
    
  );
};

export default AddContractModal;