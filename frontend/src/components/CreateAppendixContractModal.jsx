import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { createAppendixContract } from '../services/contractService';
import { toast } from 'react-toastify';

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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('文件大小不能超过10MB');
        return;
      }
      
      // 检查文件类型
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('只支持PDF、JPG、PNG格式的文件');
        return;
      }
      
      setAttachment({ file });
    }
  };

  const removeFile = () => {
    setAttachment(null);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
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
    
    // 检查需求总和
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
      // 构建提交数据
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">创建附属合同</h2>
            <p className="text-sm text-gray-600 mt-1">
              为 "{parentContract?.client_name}" 创建附属合同
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* 需求信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              需求数量 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">详情页</label>
                <input
                  type="number"
                  name="detail_pages"
                  value={formData.detail_pages}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">视频</label>
                <input
                  type="number"
                  name="video_count"
                  value={formData.video_count}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">图片</label>
                <input
                  type="number"
                  name="image_count"
                  value={formData.image_count}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">流程图</label>
                <input
                  type="number"
                  name="workflow_count"
                  value={formData.workflow_count}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {errors.requirements && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.requirements}
              </p>
            )}
          </div>

          {/* 是否充值 */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_recharged"
                checked={formData.is_recharged}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">是否充值</span>
            </label>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              合同备注
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="请输入合同相关备注信息..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 文件上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              合同文件
            </label>
            
            {!attachment ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">点击上传文件或拖拽到此处</p>
                <p className="text-xs text-gray-500">支持 PDF、JPG、PNG 格式，最大 10MB</p>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  选择文件
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? '创建中...' : '创建附属合同'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppendixContractModal;