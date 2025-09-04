import React, { useState, useEffect, useRef } from "react";
import ModalCloseButton from "./ModalCloseButton";

const AddContractModal = ({ isOpen, client, onClose, onAdd }) => {
  
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
  
  // 单文件附件
  const [attachment, setAttachment] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

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
    // 清理对象URL
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    onClose();
  };

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "application/zip",
    "application/x-zip-compressed"
  ];

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleFileSelect = (fileList) => {
    setUploadError("");
    const file = Array.from(fileList)[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("单文件大小不能超过 100MB");
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.zip')) {
      setUploadError("不支持的文件类型");
      return;
    }
    // 生成预览（仅图片）
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    // 替换已有文件
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment({ file, name: file.name, size: file.size, type: file.type, preview });
  };

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
    setUploadError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(attachment);
    onAdd(formData, attachment);
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
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
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
          
          {/* 自动结算提示 */}
          {formData.contractAmount > 0 && formData.paidAmount > 0 && (
            <div className={`rounded-lg p-3 border ${
              formData.contractAmount === formData.paidAmount 
                ? 'bg-green-50 border-green-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                <svg className={`w-5 h-5 ${
                  formData.contractAmount === formData.paidAmount 
                    ? 'text-green-600' 
                    : 'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-sm font-medium ${
                  formData.contractAmount === formData.paidAmount 
                    ? 'text-green-800' 
                    : 'text-blue-800'
                }`}>
                  {formData.contractAmount === formData.paidAmount 
                    ? '订单金额等于已付金额，合同将自动设置为已结算状态' 
                    : '订单金额大于已付金额，合同将设置为待结算状态'
                  }
                </span>
              </div>
            </div>
          )}

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
          {/* 合同文件上传 */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-800 items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              合同附件
            </label>

            {/* 上传区域（只在未选择文件时显示） */}
            {!attachment && (
              <div
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); dragCounter.current += 1; setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); dragCounter.current -= 1; if (dragCounter.current <= 0) { setIsDragging(false); dragCounter.current = 0; } }}
                onDrop={(e) => {
                  e.preventDefault();
                  dragCounter.current = 0;
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer group ${
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'
                }`}
                onClick={() => document.getElementById("file-upload-input").click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                  className="sr-only"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <svg className={`w-12 h-12 mx-auto transition-colors duration-200 ${isDragging ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-slate-600">
                  {isDragging ? (
                    <span className="font-medium text-indigo-600">松开鼠标即可上传</span>
                  ) : (
                    <>
                      <span className="font-medium text-indigo-600">点击上传</span> 或拖拽文件到这里
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  支持 PDF、Word、图片、ZIP，单文件不超过 100MB
                </p>
                {uploadError && (
                  <p className="text-xs text-red-500 mt-2">{uploadError}</p>
                )}
              </div>
            )}

            {/* 已上传文件 */}
            {attachment && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-slate-700">已选择文件</h4>
                <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                  <div className="flex items-center space-x-3 flex-1">
                    {attachment.type?.startsWith("image/") && attachment.preview ? (
                      <img src={attachment.preview} className="w-10 h-10 object-cover rounded" alt="preview" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                        <span className="text-xs text-slate-500">
                          {attachment.name.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{attachment.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-500">已选择</span>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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