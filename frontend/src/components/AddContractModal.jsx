import React, { useState, useEffect } from "react";
import ModalCloseButton from "./ModalCloseButton";

const AddContractModal = ({ isOpen, client, onClose, onAdd }) => {
  if (!isOpen) return null;
  
  const [formData, setFormData] = useState({
    contractAmount: 0,
    paidAmount: 0,
    detailPages: 0,
    videos: 0,
    images: 0,
    workflows: 0,
    transactionTime: "",
    isRecharged: false, // 新增：客户是否充值
  });
  
  // 修正后的输入处理函数
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // 关键：对于复选框，使用 `checked` 属性；对于其他输入，使用 `value`
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in transform transition-all duration-300 scale-100">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-slate-800">添加合同</h2>
            </div>
            <ModalCloseButton onClose={handleClose} />
          </div>
        </div>
        
        <form id="order-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 客户信息 */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {client?.name?.charAt(0)?.toUpperCase() || 'C'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-800">{client?.name || '客户'}</h3>
                <p className="text-sm text-slate-500">正在为该客户创建新合同</p>
              </div>
            </div>
          </div>

          {/* 客户充值状态 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
            <div className="flex items-center space-x-3">
              {/* 外层div添加onClick事件 */}
              <div 
                className="relative cursor-pointer"
                onClick={() => {
                  // 点击整个区域时，切换复选框状态
                  setFormData(prev => ({ ...prev, isRecharged: !prev.isRecharged }));
                }}
              >
                <input
                  type="checkbox"
                  id="is-recharged"
                  name="isRecharged"
                  checked={formData.isRecharged}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div 
                  className={`w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${
                    formData.isRecharged ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-300 ease-in-out ${
                      formData.isRecharged ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  ></div>
                </div>
              </div>
              <div>
                <label htmlFor="is-recharged" className="text-sm font-medium text-slate-800 cursor-pointer">
                  客户已充值
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  标记此客户是否已完成充值，便于后续跟进
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 my-6" />

          {/* 订单金额信息 */}
          <h3 className="text-base font-semibold text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            订单金额信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="contract-amount" className="block text-sm font-medium text-slate-700 mb-2">
                订单金额 (元) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">¥</span>
                <input
                  type="number"
                  id="contract-amount"
                  name="contractAmount"
                  min="0"
                  step="0.01"
                  value={formData.contractAmount}
                  onChange={handleInputChange}
                  className="block w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="paid-amount" className="block text-sm font-medium text-slate-700 mb-2">
                已付金额 (元) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">¥</span>
                <input
                  type="number"
                  id="paid-amount"
                  name="paidAmount"
                  min="0"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                  className="block w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 my-6" />

          {/* 订单需求明细 */}
          <h3 className="text-base font-semibold text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            订单需求明细
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="detail-pages" className="block text-sm font-medium text-slate-700 mb-2">
                详情页 (套)
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    id="detail-pages"
                    name="detailPages"
                    min="0"
                    step="1"
                    value={formData.detailPages}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium min-w-max">
                  {formData.detailPages} 套
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="videos" className="block text-sm font-medium text-slate-700 mb-2">
                视频 (套)
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    id="videos"
                    name="videos"
                    min="0"
                    step="1"
                    value={formData.videos}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium min-w-max">
                  {formData.videos} 套
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-slate-700 mb-2">
                图片 (张)
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    id="images"
                    name="images"
                    min="0"
                    step="1"
                    value={formData.images}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium min-w-max">
                  {formData.images} 张
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="workflows" className="block text-sm font-medium text-slate-700 mb-2">
                工作流 (个)
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    id="workflows"
                    name="workflows"
                    min="0"
                    step="1"
                    value={formData.workflows}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium min-w-max">
                  {formData.workflows} 个
                </div>
              </div>
            </div>
          </div>
          
          <hr className="border-slate-200 my-6" />
          
          {/* 成交时间 (恢复为原始样式) */}
          <div className="space-y-2">
              <label htmlFor="transaction-time" className="block text-sm font-medium text-slate-700">
                成交时间
              </label>
              <input
                type="datetime-local"
                id="transaction-time"
                name="transactionTime"
                value={formData.transactionTime}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
          </div>
          
          {/* 提交按钮 */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                id="cancel-order-form"
                className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors duration-200 font-medium text-sm"
                onClick={handleClose}
              >
                取消
              </button>
              <button
                type="submit"
                id="submit-order-form"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                保存订单
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContractModal;