import React, { useState, useEffect } from "react";
import AddressSelector from "./AddressSelector";
import ModalCloseButton from "./ModalCloseButton";
import { getClientInfo } from "../services/clientService";
import { getSalesList } from "../services/authService";

const SalesClientModal = ({ isOpen, id = null, onClose, onSave }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    contact_phone: "",
    source: "线上", // 固定为线上
    online_source: "",
    activity_name: "", // 保留字段
    product_type: "",
    scale: "",
    address: null,
    sales_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // 统一加载状态
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesOptions, setSalesOptions] = useState([]);

  // 加载销售列表
  useEffect(() => {
    const loadSales = async () => {
      setLoadingSales(true);
      try {
        const res = await getSalesList();
        if (res.success) {
          setSalesOptions(res.data);
        }
      } catch (error) {
        console.error("加载销售列表失败", error);
        setSalesOptions([]);
      } finally {
        setLoadingSales(false);
      }
    };
    loadSales();
  }, []);

  // 根据 id 加载客户数据
  useEffect(() => {
    if (id) {
      setLoading(true);
      getClientInfo(id)
        .then((res) => {
          if (res.success) {
            setFormData(res.data);
          } else {
            alert("加载客户信息失败");
          }
        })
        .catch((err) => {
          console.error("获取客户信息出错", err);
          alert("加载客户数据失败");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // 新增模式：重置表单
      setFormData({
        name: "",
        contact_name: "",
        contact_phone: "",
        source: "线上",
        online_source: "",
        activity_name: "",
        product_type: "",
        scale: "",
        address: null,
        sales_id: "",
      });
    }
  }, [id]); // 依赖 id 变化

  // 输入变化处理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "source") return; // 禁止修改 source
    if (name === "street") {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, street: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddressSelectorChange = (codes) => {
    const [province, city, district] = codes || [];
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, province, city, district },
    }));
    setErrors((prev) => ({ ...prev, address: null }));
  };

  // 表单提交
  const handleSubmit = (e) => {
    e.preventDefault();

    // 必填验证
    if (!formData.online_source) {
      setErrors((prev) => ({ ...prev, online_source: "请选择线上来源类型" }));
      return;
    }
    if (!formData.sales_id) {
      setErrors((prev) => ({ ...prev, sales_id: "请选择销售负责人" }));
      return;
    }

    // 提交数据（包含 id 用于编辑）
    onSave(formData);
    onClose();
  };

  // 关闭模态框
  const handleClose = () => {
    setFormData({
      name: "",
      contact_name: "",
      contact_phone: "",
      source: "线上",
      online_source: "",
      activity_name: "",
      product_type: "",
      scale: "",
      address: null,
      sales_id: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-800">
            {id ? "编辑客户" : "新增线上客户"}
          </h2>
          <ModalCloseButton onClose={handleClose} />
        </div>

        {loading ? (
          <p className="text-center py-4">加载中...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* 客户来源（固定显示） */}
              <div>
                <label className="block text-sm font-medium text-slate-700">客户来源</label>
                <div className="mt-1 inline-flex items-center px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
                  线上
                </div>
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

              {/* 线上来源类型 */}
              <div>
                <label htmlFor="online-source" className="block text-sm font-medium text-slate-700">
                  线上来源类型 <span className="text-red-500">*</span>
                </label>
                <select
                  id="online-source"
                  name="online_source"
                  value={formData.online_source}
                  onChange={handleInputChange}
                  className="form-select block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  required
                >
                  <option value="">请选择来源</option>
                  <option value="系统推广流">系统推广流</option>
                  <option value="自然流">自然流</option>
                </select>
                {errors.online_source && (
                  <p className="mt-1 text-sm text-red-600">{errors.online_source}</p>
                )}
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

              {/* 销售负责人 */}
              <div>
                <label htmlFor="sales-person" className="block text-sm font-medium text-slate-700">
                  销售负责人 <span className="text-red-500">*</span>
                </label>
                {loadingSales ? (
                  <p className="text-sm text-slate-500 mt-1">加载中...</p>
                ) : (
                  <select
                    id="sales-person"
                    name="sales_id"
                    value={formData.sales_id}
                    onChange={handleInputChange}
                    className="form-select block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                    required
                  >
                    <option value="">请选择销售</option>
                    {salesOptions.map((sales) => (
                      <option key={sales.id} value={sales.id}>
                        {sales.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.sales_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.sales_id}</p>
                )}
              </div>
            </div>

            {/* 地址 */}
            <div>
              <label className="block text-sm font-medium text-slate-700">地址</label>
              <AddressSelector
                value={[
                  formData.address?.province || "",
                  formData.address?.city || "",
                  formData.address?.district || "",
                ]}
                onChange={handleAddressSelectorChange}
              />
              <label className="block text-sm font-medium text-slate-700 mb-1.5">详细地址</label>
              <input
                type="text"
                name="street"
                value={formData.address?.street || ""}
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
                {id ? "更新" : "提交"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SalesClientModal;