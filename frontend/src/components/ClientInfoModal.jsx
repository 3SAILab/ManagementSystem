import React, { useState, useEffect } from "react";
import AddressSelector from "./AddressSelector";
import ModalCloseButton from "./ModalCloseButton";
import { getClientInfo } from "../services/clientService";

const ClientInfoModal = ({ isOpen, id = null, onClose, onSave }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    contact_phone: "",
    source: "",
    online_source: "",
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // 加载状态
  // 当 id 改变时，获取客户数据
  useEffect(() => {
    if (id) {
      const fetchClientData = async () => {
        setLoading(true);
        try {
          // 获取客户信息
          getClientInfo(id).then(res => {
            if (res.success) {
              setFormData(res.data);
            }
          });
        } catch (error) {
          console.error(error);
          alert("加载客户数据失败");
        } finally {
          setLoading(false);
        }
      };

      fetchClientData();
    } else {
      // 如果没有 id，重置表单
      setFormData({
        name: "",
        contact_name: "",
        contact_phone: "",
        source: "",
        online_source: "",
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
    }
  }, [id]); // 依赖 id 变化触发

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;

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
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, province, city, district }
    }));
    setErrors(prev => ({ ...prev, address: null }));
  };
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();

    const { province, city } = formData.address;
    if (!province || !city) {
      setErrors(prev => ({ ...prev, address: "请选择完整的省份和城市" }));
      return;
    }
    // 添加 E.164 格式前缀
    onSave(formData);
    onClose();
  };

  // 处理表单关闭
  const handleClose = () => {
    setFormData({
      name: "",
      contact_name: "",
      contact_phone: "",
      source: "",
      online_source: "",
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-800">{id ? "编辑客户" : "新增客户"}</h2>
          <ModalCloseButton onClose={handleClose} />
        </div>
        {loading ? (
          <p className="text-center py-4">加载中...</p>
        ) : (
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
                  联系方式 <span className="text-red-500">*</span>
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
                  <option value="活动">活动</option>
                </select>
                {/* 当选择“线上”时显示子分类 */}
                {formData.source === "线上" && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-slate-700">
                      线上来源类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="online_source"
                      value={formData.online_source}
                      onChange={handleInputChange}
                      className="form-select block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                    >
                      <option value="">请选择子分类</option>
                      <option value="系统推广流">系统推广流</option>
                      <option value="自然流">自然流</option>
                    </select>
                    {errors.online_source && (
                      <p className="mt-1 text-sm text-red-600">{errors.online_source}</p>
                    )}
                  </div>
                )}
                {/* 当选择“活动”时显示输入框 */}
                {formData.source === "活动" && (
                  <div className="mt-2">
                    <label htmlFor="activity-name" className="block text-sm font-medium text-slate-700">
                      活动名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="activity-name"
                      type="text"
                      name="activity_name"
                      value={formData.activity_name}
                      onChange={handleInputChange}
                      className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                      placeholder="请输入活动名称"
                    />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="product-type" className="block text-sm font-medium text-slate-700">
                  产品类型 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="product-type"
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleInputChange}
                  className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  required
                />
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
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
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
                onClick={handleClose}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                保存
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientInfoModal;