import React, { useState, useEffect } from "react";
import ModalCloseButton from "./ModalCloseButton";
import { getRemainingRequirements } from "../services/contractService";
import { getActiveProductTypes } from "../services/productTypeService";
import { toast } from "react-toastify";

const AddTicketModal = ({ isOpen, onClose, onAdd, contractId }) => {
  const [remainingRequirements, setRemainingRequirements] = useState({
    detail_pages: 0,
    video_count: 0,
    image_count: 0,
    workflow_count: 0,
  });
  
  const [productTypes, setProductTypes] = useState([]);
  
  // 添加错误状态管理
  const [errors, setErrors] = useState({
    detail_pages: "",
    video_count: "",
    image_count: "",
    workflow_count: "",
  });

  useEffect(() => {
    const fetchRemainingRequirements = async () => {
      const result = await getRemainingRequirements(contractId);
      if(result.success){
        setRemainingRequirements(result.data);
      }
    };
    
    const loadProductTypes = async () => {
      try {
        const res = await getActiveProductTypes();
        if (res.success) {
          setProductTypes(res.data);
        }
      } catch (error) {
        console.error('加载产品类型失败', error);
        setProductTypes([]);
      }
    };
    
    if (isOpen) {
      fetchRemainingRequirements();
      loadProductTypes();
    }
  },[isOpen, contractId]);

  const [formData, setFormData] = useState({
    name: "",
    detail_pages: 0,
    video_count: 0,
    image_count: 0,
    workflow_count: 0,
    wechatGroup: "",
    needArt: false,
    needRender: false,
    needShoot: false,
    needWatermark: true,
    notes: "",
    priority: "高", // 优先级
    platform: "国内", // 平台
    contract_id: contractId || 0, // 合同ID
    product_type_id: null, // 产品类型ID
    product_name: "", // 产品名称
    price: "", // 价格
  });

  // 验证输入值的函数
  const validateInput = (name, value) => {
    const numValue = parseInt(value) || 0;
    const maxValue = remainingRequirements[name];
    
    if (numValue < 0) {
      return "数量不能为负数";
    }
    if (numValue > maxValue) {
      return `数量不能超过剩余可用数量 (${maxValue})`;
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // 验证输入并更新错误状态
    if (["detail_pages", "video_count", "image_count", "workflow_count"].includes(name)) {
      const error = validateInput(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleClose = () => {
    // 清空错误状态
    setErrors({
      detail_pages: "",
      video_count: "",
      image_count: "",
      workflow_count: "",
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 提交前验证所有字段
    const newErrors = {};
    ["detail_pages", "video_count", "image_count", "workflow_count"].forEach(field => {
      const error = validateInput(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    // 如果有错误，不提交
    if (Object.values(newErrors).some(error => error !== "")) {
      return;
    }
    // 需求之和不能为空
    if (formData.detail_pages + formData.image_count + formData.video_count + formData.workflow_count <= 0) {
      toast.error('需求不能为空');
      return;
    }
    onAdd(formData);
    setFormData({
      name: "",
      detail_pages: 0,
      video_count: 0,
      image_count: 0,
      workflow_count: 0,
      wechatGroup: "",
      needArt: false,
      needRender: false,
      needShoot: false,
      needWatermark: true,
      notes: "",
      priority: "高", // 优先级
      platform: "国内", // 平台
      contract_id: contractId || 0, // 合同ID
      product_type_id: null, // 产品类型ID
      product_name: "", // 产品名称
      price: "", // 价格
    })
    handleClose();
  };

  // 检查是否有任何错误
  const hasErrors = Object.values(errors).some(error => error !== "");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 transform transition-all animate-scale-in">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-800">创建工单</h2>
          <ModalCloseButton onClose={handleClose} />
        </div>

        <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
          {/* 工单名称 */}
          <div>
            <label htmlFor="ticket-name" className="block text-sm font-medium text-slate-700">
              工单名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="ticket-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入工单名称"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <hr className="border-slate-200" />

          {/* 需求明细 */}
          <h3 className="text-base font-semibold text-slate-800">订单需求明细<span className="text-red-500">*</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="detail-pages" className="block text-sm font-medium text-slate-700 mb-1">
                详情页 (套) <span className="text-xs text-slate-500">剩余: {remainingRequirements.detail_pages}</span>
              </label>
              <input
                type="number"
                id="detail-pages"
                name="detail_pages"
                min="0"
                max={remainingRequirements.detail_pages}
                value={formData.detail_pages}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.detail_pages ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
                }`}
              />
              {errors.detail_pages && (
                <p className="text-red-500 text-xs mt-1">{errors.detail_pages}</p>
              )}
            </div>
            <div>
              <label htmlFor="videos" className="block text-sm font-medium text-slate-700 mb-1">
                视频 (套) <span className="text-xs text-slate-500">剩余: {remainingRequirements.video_count}</span>
              </label>
              <input
                type="number"
                id="videos"
                name="video_count"
                min="0"
                max={remainingRequirements.video_count}
                value={formData.video_count}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.video_count ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
                }`}
              />
              {errors.video_count && (
                <p className="text-red-500 text-xs mt-1">{errors.video_count}</p>
              )}
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-slate-700 mb-1">
                图片 (张) <span className="text-xs text-slate-500">剩余: {remainingRequirements.image_count}</span>
              </label>
              <input
                type="number"
                id="images"
                name="image_count"
                min="0"
                max={remainingRequirements.image_count}
                value={formData.image_count}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.image_count ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
                }`}
              />
              {errors.image_count && (
                <p className="text-red-500 text-xs mt-1">{errors.image_count}</p>
              )}
            </div>
            <div>
              <label htmlFor="workflows" className="block text-sm font-medium text-slate-700 mb-1">
                工作流 (个) <span className="text-xs text-slate-500">剩余: {remainingRequirements.workflow_count}</span>
              </label>
              <input
                type="number"
                id="workflows"
                name="workflow_count"
                min="0"
                max={remainingRequirements.workflow_count}
                value={formData.workflow_count}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.workflow_count ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
                }`}
              />
              {errors.workflow_count && (
                <p className="text-red-500 text-xs mt-1">{errors.workflow_count}</p>
              )}
            </div>
          </div>

          {/* 优先级和平台 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
                优先级<span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </div>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-slate-700 mb-1">
                平台<span className="text-red-500">*</span>
              </label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="国内">国内</option>
                <option value="国外">国外</option>
              </select>
            </div>
          </div>

          {/* 产品信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="product-type" className="block text-sm font-medium text-slate-700 mb-1">
                产品类型
              </label>
              <select
                id="product-type"
                name="product_type_id"
                value={formData.product_type_id || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">请选择产品类型</option>
                {productTypes.map((productType) => (
                  <option key={productType.id} value={productType.id}>
                    {productType.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-slate-700 mb-1">
                产品名称
              </label>
              <input
                type="text"
                id="product-name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                placeholder="请输入产品名称"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
                价格 (元)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="请输入价格"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 微信群 */}
          <div>
            <label htmlFor="wechat-group" className="block text-sm font-medium text-slate-700 mb-1">
              微信群<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="wechat-group"
              name="wechatGroup"
              value={formData.wechatGroup}
              onChange={handleInputChange}
              placeholder="请输入微信群"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          {/* 需求类型 */}
          <div className="rounded-lg bg-slate-50 p-4 space-y-3">
            <h3 className="text-sm font-medium text-slate-700">请选择需要的服务<span className="text-red-500">*</span></h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="needArt"
                  checked={formData.needArt}
                  onChange={handleInputChange}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                需要美工
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="needRender"
                  checked={formData.needRender}
                  onChange={handleInputChange}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                需要渲染
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="needShoot"
                  checked={formData.needShoot}
                  onChange={handleInputChange}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                需要拍摄
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="needWatermark"
                  checked={formData.needWatermark}
                  onChange={handleInputChange}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                需要水印
              </label>
            </div>
          </div>
          {/* 备注 */}
          <div className="space-y-2">
            <label htmlFor="order-notes" className="block text-sm font-medium text-slate-700">
              备注
            </label>
            <textarea
              id="order-notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="请输入订单备注信息..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
              onClick={handleClose}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={hasErrors}
              className={`px-4 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                hasErrors 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              保存订单
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicketModal;