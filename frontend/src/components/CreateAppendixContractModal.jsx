import React, { useState, useEffect, useRef } from "react";
import { X, Upload, AlertCircle } from 'lucide-react';
import { createAppendixContract } from '../services/contractService';
import { toast } from 'react-toastify';
import ModalCloseButton from './ModalCloseButton'; // 假设你有这个组件

const CreateAppendixContractModal = ({ isOpen, onClose, parentContract, onSuccess }) => {
  const [formData, setFormData] = useState({
    contract_type: '复购',
    total_amount: '',
    paid_amount: '',
    detail_pages: 0,
    video_count: 0,
    image_count: 0,
    workflow_count: 0,
    transaction_time: '',
    is_recharged: false,
    notes: ''
  });

  const [attachment, setAttachment] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png"
  ];

  // 初始化成交时间为当前时间
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setFormData(prev => ({
      ...prev,
      transaction_time: `${year}-${month}-${day}T${hours}:${minutes}`
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // 清除对应字段错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (fileList) => {
    setUploadError("");
    const file = Array.from(fileList)[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('文件大小不能超过 10MB');
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('只支持 PDF、JPG、PNG 格式');
      return;
    }

    // 生成预览（仅图片）
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

    // 清理旧预览
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);

    setAttachment({ file, name: file.name, size: file.size, type: file.type, preview });
  };

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      newErrors.total_amount = '合同总额必须大于0';
    }

    if (!formData.paid_amount || parseFloat(formData.paid_amount) < 0) {
      newErrors.paid_amount = '已付金额不能为负数';
    }

    if (parseFloat(formData.paid_amount) > parseFloat(formData.total_amount)) {
      newErrors.paid_amount = '已付金额不能大于合同总额';
    }

    if (!formData.transaction_time) {
      newErrors.transaction_time = '成交时间不能为空';
    }

    const totalRequirements = parseInt(formData.detail_pages) +
                            parseInt(formData.video_count) +
                            parseInt(formData.image_count) +
                            parseInt(formData.workflow_count);

    if (totalRequirements <= 0) {
      newErrors.requirements = '至少需要填写一项需求';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const contractData = {
        ...formData,
        client_id: parentContract.client_id,
        total_amount: parseFloat(formData.total_amount),
        paid_amount: parseFloat(formData.paid_amount),
        detail_pages: parseInt(formData.detail_pages),
        video_count: parseInt(formData.video_count),
        image_count: parseInt(formData.image_count),
        workflow_count: parseInt(formData.workflow_count)
      };

      const result = await createAppendixContract(
        parentContract.id,
        contractData,
        attachment
      );

      if (result.success) {
        toast.success('附属合同创建成功！');
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(result.error || '创建失败，请重试');
      }
    } catch (error) {
      toast.error('创建失败，请重试');
      console.error('创建附属合同失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    onClose();
  };

  // 组件卸载时清理预览 URL，避免内存泄漏
  useEffect(() => {
    return () => {
      if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    };
  }, [attachment]);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-fade-in transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto" style={{ willChange: 'transform', transform: 'translateZ(0)', contain: 'content' }}>
        {/* 头部 */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800">创建附属合同</h2>
            </div>
            <ModalCloseButton onClose={handleClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 客户信息 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {parentContract?.client_name?.charAt(0)?.toUpperCase() || 'C'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">{parentContract?.client_name || '客户'}</h3>
                <p className="text-sm text-gray-500">正在为该客户创建附属合同</p>
              </div>
            </div>
          </div>

          {/* 是否充值 - 开关按钮 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_recharged: !prev.is_recharged }))}>
              <div className="relative">
                <input
                  type="checkbox"
                  id="is-recharged"
                  name="is_recharged"
                  checked={formData.is_recharged}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${
                    formData.is_recharged ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-300 ease-in-out ${
                      formData.is_recharged ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  ></div>
                </div>
              </div>
              <div>
                <label htmlFor="is-recharged" className="text-sm font-medium text-gray-800">
                  是否充值
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  标记此合同是否关联客户充值行为
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 my-6" />

          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                合同类型 <span className="text-red-500">*</span>
              </label>
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="复购">复购</option>
                <option value="试单">试单</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                成交时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="transaction_time"
                value={formData.transaction_time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.transaction_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.transaction_time && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.transaction_time}
                </p>
              )}
            </div>
          </div>

          {/* 金额信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                合同总额 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.total_amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.total_amount && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.total_amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                已付金额 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  name="paid_amount"
                  value={formData.paid_amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.paid_amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.paid_amount && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.paid_amount}
                </p>
              )}
            </div>
          </div>

          {/* 金额状态提示 */}
          {formData.total_amount && formData.paid_amount && (
            <div className={`rounded-lg p-3 border ${
              parseFloat(formData.paid_amount) >= parseFloat(formData.total_amount)
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                <svg className={`w-5 h-5 ${parseFloat(formData.paid_amount) >= parseFloat(formData.total_amount) ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-sm font-medium ${
                  parseFloat(formData.paid_amount) >= parseFloat(formData.total_amount)
                    ? 'text-green-800'
                    : 'text-blue-800'
                }`}>
                  {parseFloat(formData.paid_amount) >= parseFloat(formData.total_amount)
                    ? '已付金额 ≥ 合同总额，标记为已完成支付'
                    : '已付金额小于合同总额，标记为部分支付'}
                </span>
              </div>
            </div>
          )}

          <hr className="border-gray-200 my-6" />

          {/* 需求数量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              需求数量 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'detail_pages', label: '详情页', unit: '套' },
                { key: 'video_count', label: '视频', unit: '个' },
                { key: 'image_count', label: '图片', unit: '张' },
                { key: 'workflow_count', label: '工作流', unit: '个' }
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1">{label}</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                      {formData[key]} {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {errors.requirements && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.requirements}
              </p>
            )}
          </div>

          {/* 合同备注 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              合同备注
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="请输入合同相关备注信息..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 文件上传区域 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-600" />
              合同文件
            </label>

            {!attachment ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                  setIsDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  dragCounter.current += 1;
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  dragCounter.current -= 1;
                  if (dragCounter.current <= 0) {
                    setIsDragging(false);
                    dragCounter.current = 0;
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  dragCounter.current = 0;
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer group ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <Upload className={`w-12 h-12 mx-auto transition-colors duration-200 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
                }`} />
                <p className="mt-3 text-sm text-gray-600">
                  {isDragging ? (
                    <span className="font-medium text-blue-600">松开鼠标即可上传</span>
                  ) : (
                    <>
                      <span className="font-medium text-blue-600">点击上传</span> 或拖拽文件到这里
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  支持 PDF、JPG、PNG 格式，最大 10MB
                </p>
                {uploadError && (
                  <p className="text-xs text-red-500 mt-2">{uploadError}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">已选择文件</h4>
                <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                  <div className="flex items-center space-x-3 flex-1">
                    {attachment.type?.startsWith("image/") && attachment.preview ? (
                      <img src={attachment.preview} className="w-10 h-10 object-cover rounded" alt="preview" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          {attachment.name.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-500">已上传</span>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>创建中...</span>
                </>
              ) : (
                <span>创建附属合同</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppendixContractModal;