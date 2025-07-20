import React, { useState } from "react";
import ModalCloseButton from "./ModalCloseButton";

const AddTicketModal = ({ isOpen, onClose, onAdd, contractId }) => {
  if (!isOpen) return null;

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
    notes: "",
    priority: "高", // 优先级
    platform: "国内", // 平台
    contract_id: contractId || 0, // 合同ID
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
                详情页 (套)
              </label>
              <input
                type="number"
                id="detail-pages"
                name="detail_pages"
                min="0"
                value={formData.detail_pages}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="videos" className="block text-sm font-medium text-slate-700 mb-1">
                视频 (套)
              </label>
              <input
                type="number"
                id="videos"
                name="video_count"
                min="0"
                value={formData.video_count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-slate-700 mb-1">
                图片 (张)
              </label>
              <input
                type="number"
                id="images"
                name="image_count"
                min="0"
                value={formData.image_count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="workflows" className="block text-sm font-medium text-slate-700 mb-1">
                工作流 (个)
              </label>
              <input
                type="number"
                id="workflows"
                name="workflow_count"
                min="0"
                value={formData.workflow_count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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