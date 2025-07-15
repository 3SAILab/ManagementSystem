import React, { useState } from "react";

const AddContractModal = ({ client, ticket }) => {
  const [formData, setFormData] = useState({
    contractAmount: 0,
    paidAmount: 0,
    commissionRate: 0,
    detailPages: 0,
    videos: 0,
    images: 0,
    workflows: 0,
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Form Data:", formData);
    alert("表单已提交，请查看控制台");
  };

  return (
    <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息标题 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium text-slate-800">{client?.name}</div>
          <div className="text-sm text-slate-500">{ticket?.orderName}</div>
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
          className="form-textarea block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        ></textarea>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          id="cancel-order-form"
          className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
        >
          取消
        </button>
        <button
          type="submit"
          id="submit-order-form"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          保存订单
        </button>
      </div>
    </form>
  );
};

export default AddContractModal;