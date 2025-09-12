import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, GripVertical, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
  toggleProductTypeStatus,
  reorderProductTypes
} from '../services/productTypeService';

// 模态框组件
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
const ProductTypeManagePage = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    is_active: true
  });
  const [draggedIndex, setDraggedIndex] = useState(null);

  // 加载产品类型列表
  const loadProductTypes = async () => {
    setLoading(true);
    try {
      const response = await getProductTypes({});
      if (response.success) {
        setProductTypes(response.data.data.product_types);
      } else {
        toast.error('加载产品类型失败');
      }
    } catch (error) {
      console.error('加载产品类型失败:', error);
      toast.error('加载产品类型失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductTypes();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 创建产品类型
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await createProductType(formData);
      if (response.success) {
        toast.success('创建产品类型成功！');
        setIsCreateModalOpen(false);
        setFormData({ name: '', is_active: true });
        loadProductTypes();
      } else {
        toast.error(response.error || '创建产品类型失败');
      }
    } catch (error) {
      console.error('创建产品类型失败:', error);
      toast.error('创建产品类型失败');
    }
  };

  // 编辑产品类型
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProductType(editingProductType.id, formData);
      if (response.success) {
        toast.success('更新产品类型成功！');
        setIsEditModalOpen(false);
        setEditingProductType(null);
        setFormData({ name: '', is_active: true });
        loadProductTypes();
      } else {
        toast.error(response.error || '更新产品类型失败');
      }
    } catch (error) {
      console.error('更新产品类型失败:', error);
      toast.error('更新产品类型失败');
    }
  };

  // 删除产品类型
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个产品类型吗？此操作不可恢复。')) {
      return;
    }
    try {
      const response = await deleteProductType(id);
      if (response.success) {
        toast.success('删除产品类型成功！');
        loadProductTypes();
      } else {
        toast.error(response.error || '删除产品类型失败');
      }
    } catch (error) {
      console.error('删除产品类型失败:', error);
      toast.error('删除产品类型失败');
    }
  };

  // 切换激活状态
  const handleToggleStatus = async (id) => {
    try {
      const response = await toggleProductTypeStatus(id);
      if (response.success) {
        toast.success('状态更新成功！');
        loadProductTypes();
      } else {
        toast.error(response.error || '状态更新失败');
      }
    } catch (error) {
      console.error('状态更新失败:', error);
      toast.error('状态更新失败');
    }
  };

  // 打开编辑模态框
  const openEditModal = (productType) => {
    setEditingProductType(productType);
    setFormData({
      name: productType.name,
      is_active: productType.is_active
    });
    setIsEditModalOpen(true);
  };

  // 拖拽处理
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updatedTypes = [...productTypes];
    const draggedItem = updatedTypes[draggedIndex];
    
    // 移除拖拽的项目
    updatedTypes.splice(draggedIndex, 1);
    // 插入到新位置
    updatedTypes.splice(dropIndex, 0, draggedItem);
    
    // 更新本地状态
    setProductTypes(updatedTypes);
    setDraggedIndex(null);
    
    // 生成重排序数据
    const reorderData = updatedTypes.map((item, index) => ({
      id: item.id,
      sort_order: index + 1
    }));
    
    try {
      const response = await reorderProductTypes(reorderData);
      if (response.success) {
        toast.success('排序更新成功！');
        loadProductTypes(); // 重新加载以确保数据一致性
      } else {
        toast.error(response.error || '排序更新失败');
        loadProductTypes(); // 失败时恢复原始数据
      }
    } catch (error) {
      console.error('排序更新失败:', error);
      toast.error('排序更新失败');
      loadProductTypes(); // 失败时恢复原始数据
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">产品类型管理</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
        >
          <Plus size={16} />
          新增产品类型
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-500">加载中...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排序
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  产品类型名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排序值
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productTypes.map((productType, index) => (
                <tr
                  key={productType.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="hover:bg-gray-50 cursor-move"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <GripVertical size={16} className="text-gray-400" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {productType.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(productType.id)}
                      className="flex items-center"
                    >
                      {productType.is_active ? (
                        <ToggleRight className="text-green-500" size={24} />
                      ) : (
                        <ToggleLeft className="text-gray-400" size={24} />
                      )}
                      <span className={`ml-2 text-sm ${productType.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {productType.is_active ? '启用' : '禁用'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {productType.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(productType.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(productType)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {productTypes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">暂无产品类型数据</p>
            </div>
          )}
        </div>
      )}

      {/* 创建模态框 */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title="新增产品类型"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              产品类型名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active_create"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
            />
            <label htmlFor="is_active_create" className="ml-2 text-sm text-slate-700">
              启用状态
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              创建
            </button>
          </div>
        </form>
      </Modal>

      {/* 编辑模态框 */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="编辑产品类型"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              产品类型名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active_edit"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
            />
            <label htmlFor="is_active_edit" className="ml-2 text-sm text-slate-700">
              启用状态
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
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
      </Modal>
    </div>
  );
};

export default ProductTypeManagePage;