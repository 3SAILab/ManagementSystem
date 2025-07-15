import React, { useState } from "react";
import AddressSelector from "./AddressSelector";
import { useForm } from "react-hook-form";
import ModalCloseButton from "./ModalCloseButton";

const AddClientModal = ({ isOpen, id = null, onClose, onAdd }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    contact_phone: "",
    source: "",
    product_type: "",
    scale: "",
    address: {
      province: "",
      city: "",
      district: "",
      street: "",
    },
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // 街道输入单独更新到 address.street
    if (name === 'street') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, street: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddressSelectorChange = (codes) => {
    const [province, city, district] = codes || [];
    setFormData((prev) => ({
      ...prev,
      address: {
        ...((prev.address) || {}),
        province: province || '',
        city: city || '',
        district: district || ''
      }
    }));
    setValue("address", [province, city, district]);
  };
  const {
    formState: { errors },
    watch,
    setValue,
    setError
  } = useForm();
  

  const address = watch("address", ["", "", ""]); // 默认值 [province, city, district]
  const handleSubmit = (e) => {
    e.preventDefault();

    if(address[0] === "" || address[1] === "") {
        setError("address", { message: "请选择完整的省份和城市" });
        return;
    }
    
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-800">新增客户</h2>
          <ModalCloseButton onClose={onClose} />
        </div>
        <form id="order-form" onSubmit={handleSubmit} className="space-y-6">

          {/* 客户信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="client-name" className="block text-sm font-medium text-slate-700">
                客户名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="client-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div>
              <label htmlFor="contact-person" className="block text-sm font-medium text-slate-700">
                联系人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contact-person"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contact-phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div>
              <label htmlFor="client-source" className="block text-sm font-medium text-slate-700">
                客户来源 <span className="text-red-500">*</span>
              </label>
              <select
                id="client-source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="form-select block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              >
                <option value="">请选择客户来源</option>
                <option value="线下">线下</option>
                <option value="线上">线上</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label htmlFor="product-type" className="block text-sm font-medium text-slate-700">
                产品类型 <span className="text-red-500">*</span>
              </label>
              <select
                id="product-type"
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                className="form-select block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              >
                <option value="">请选择产品类型</option>
                <option value="营销">营销</option>
                <option value="管理">管理</option>
                <option value="数据">数据</option>
                <option value="平台">平台</option>
                <option value="集成">集成</option>
              </select>
            </div>
            <div>
              <label htmlFor="client-size" className="block text-sm font-medium text-slate-700">
                客户规模 <span className="text-red-500">*</span>
              </label>
              <select
                id="client-size"
                name="scale"
                value={formData.scale}
                onChange={handleInputChange}
                className="form-select block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                required
              >
                <option value="">请选择客户规模</option>
                <option value="小">小</option>
                <option value="中">中</option>
                <option value="大">大</option>
              </select>
            </div>
          </div>

          {/* 地址信息 */}
          <div className="md:col-span-6">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                地址 <span className="text-red-500">*</span>
            </label>
            <AddressSelector
                id="address"
                value={[
                formData.address?.province || '',
                formData.address?.city || '',
                formData.address?.district || ''
                ]}
                onChange={handleAddressSelectorChange}
            />
            {/* 错误提示 */}
            {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1.5">详细地址</label>
            <input
              type="text"
              name="street"
              value={formData.address?.street || ''}
              onChange={handleInputChange}
              placeholder="详细街道、楼牌号等"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>


          <hr className="my-6" />

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              id="cancel-order-form"
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              id="submit-order-form"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;