import React, { useState, useEffect } from 'react';
import { getEmployeeById } from '../services/authService';
import { getDepartments } from '../services/departmentService';
import { getPositionsByDepartmentId } from '../services/positionService';
import { getManagers } from '../services/authService';
import AddressSelector from './AddressSelector';
import { toast } from 'react-toastify';
import ModalCloseButton from './ModalCloseButton';

export default function EmployeeFormModal({ isOpen, id = null, onClose, onSave }) {
  // 初始表单数据
  const initialEmployeeState = {
    name: '', gender: '', birth_date: '', marital_status: '', id_number: '', phone: '', email: '',
    address: {},
    emergency_contact: { name: '', phone: '' },
    hire_date: '', status: '', department_id: '', position_id: '', role: '', manager_id: '',
    is_probation: false, education: '', university: '', major: '', graduation_date: '',
    base_salary: '', performance_salary: '', bank_account: '', work_performance_score: 0, attendance_performance_score: 0
  };
  // 根据模态打开/关闭和 id 初始化或重置表单
  useEffect(() => {
    async function syncForm() {
      if (isOpen) {
        // 打开则加载或重置数据
        if (id) {
          const data = await getEmployeeById(id);
          if (data.success) {
            console.log("当前员工数据", data);
            setEmployee(data.data);
            // 编辑时预加载部门、职位、上级
            const posOpts = await getPositionOptions(data.data.department_id, data.data.position_id);
            console.log("syncForm职位选项", posOpts);
            setPositionOptions(Array.isArray(posOpts) ? posOpts : []);
            const mgrOpts = await getManagerOptions(data.data.department_id);
            console.log("syncForm上级选项", mgrOpts);
            setManagerOptions(Array.isArray(mgrOpts) ? mgrOpts : []);
          } else {
            console.error("获取员工数据失败", data.error);
          }
        } else {
          setEmployee(initialEmployeeState);
          setPositionOptions([]);
          setManagerOptions([]);
        }
        // 部门列表
        const depts = await getDepartments();
        setDepartments(depts.data);
        setDepartmentOptions(depts.data);
      } else {
        // 关闭则重置所有
        setEmployee(initialEmployeeState);
        setDepartments([]);
        setDepartmentOptions([]);
        setPositionOptions([]);
        setManagerOptions([]);
      }
    }
    syncForm();
  }, [isOpen, id]);

  const isNew = id === null;
  const [employee, setEmployee] = useState({});
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [managerRoleOptions, setManagerRoleOptions] = useState([]);
  const [managers,setManagers] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressChange = (field) => (e) => {
    setEmployee((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: e.target.value
      }
    }));
  };
  // 级联选择器地址改变处理
  const handleAddressSelectorChange = (codes) => {
    const [province, city, district] = codes || [];
    setEmployee((prev) => ({
      ...prev,
      address: {
        ...((prev.address) || {}),
        province: province || '',
        city: city || '',
        district: district || ''
      }
    }));
  };

  const handleEmergencyContactChange = (field) => (e) => {
    setEmployee((prev) => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [field]: e.target.value
      }
    }));
  };

  const handleDepartmentChange = async (e) => {
    const department_id = e.target.value;
    // 更新员工部门并重置职位和上级
    setEmployee((prev) => ({ ...prev, department_id, position_id: '', manager_id: '' }));
    // 异步获取职位选项
    const posOpts = await getPositionOptions(department_id);
    setPositionOptions(Array.isArray(posOpts) ? posOpts : []);
    // 异步获取上级选项
    const mgrOpts = await getManagerOptions(department_id);
    setManagerOptions(Array.isArray(mgrOpts) ? mgrOpts : []);
  };

  const getPositionOptions = async (department_id, selectedPositionId) => {
    if (!department_id) return [{ value: '', label: '暂无数据' }];
    //根据部门id获取职位信息
    const positions = await getPositionsByDepartmentId(department_id);
    if (positions.success) {
      return positions.data.map(p => ({ value: p.id, label: p.name, selected: p.id === selectedPositionId }));
    } else {
      toast.error('获取职位列表失败');
      return [{ value: '', label: '暂无数据' }];
    }
  };

  const getManagerOptions = async (department_id) => {
    //上级的级别要高于当前员工
    if (!department_id) return [{ value: '', label: '暂无数据' }];
    if (!employee.role) return [{ value: '', label: '暂无数据' }];
    const managers = await getManagers(department_id, employee.role);
    if (managers.success) {
      return managers.data.map(m => ({ value: m.id, label: m.name, selected: m.role === employee.role && m.department_id === department_id }));
    } else {
      toast.error('获取上级列表失败');
      return [{ value: '', label: '暂无数据' }];
    }
  };

  // 当部门或角色改变时，重新获取上级列表
  useEffect(() => {
    async function fetchMgrOpts() {
      if (employee.department_id && employee.role) {
        const opts = await getManagerOptions(employee.department_id);
        setManagerOptions(Array.isArray(opts) ? opts : []);
      }
    }
    fetchMgrOpts();
  }, [employee.department_id, employee.role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(employee); // 提交保存逻辑
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto py-8 flex items-start justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-auto">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{isNew ? '新增员工' : `编辑员工 - ${employee.name}`}</h2>
            <ModalCloseButton onClose={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* 个人与联系信息 */}
          <fieldset className="border-t border-slate-200 pt-6">
            <legend className="text-base font-semibold text-slate-900 mb-4">个人与联系信息</legend>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-5">
              {/* 姓名 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={employee.name || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 性别 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">性别</label>
                <select
                  name="gender"
                  value={employee.gender || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">请选择性别</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>

              {/* 出生日期 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">出生日期</label>
                <input
                  type="date"
                  name="birth_date"
                  value={employee.birth_date || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 婚姻状况 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">婚姻状况</label>
                <select
                  name="marital_status"
                  value={employee.marital_status || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">请选择</option>
                  <option value="未婚">未婚</option>
                  <option value="已婚">已婚</option>
                  <option value="离异">离异</option>
                  <option value="丧偶">丧偶</option>
                </select>
              </div>

              {/* 身份证号 */}
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">身份证号</label>
                <input
                  type="text"
                  name="id_number"
                  value={employee.id_number || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 联系电话 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">联系电话</label>
                <input
                  type="tel"
                  name="phone"
                  value={employee.phone || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 邮箱地址 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  邮箱地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={employee.email || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 地址 */}
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">家庭住址</label>
                <AddressSelector
                  value={[
                    employee.address?.province || '',
                    employee.address?.city || '',
                    employee.address?.district || ''
                  ]}
                  onChange={handleAddressSelectorChange}
                />
                <input
                  type="text"
                  name="street_address"
                  value={employee.address?.street || ''}
                  onChange={handleAddressChange('street')}
                  placeholder="详细街道、楼牌号等"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 紧急联系人 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">紧急联系人姓名</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={employee.emergency_contact?.name || ''}
                  onChange={handleEmergencyContactChange('name')}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">紧急联系人电话</label>
                <input
                  type="text"
                  name="emergency_contact_phone"
                  value={employee.emergency_contact?.phone || ''}
                  onChange={handleEmergencyContactChange('phone')}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </fieldset>

          {/* 任职信息 */}
          <fieldset className="border-t border-slate-200 pt-6">
            <legend className="text-base font-semibold text-slate-900 mb-4">任职信息</legend>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-5 mt-4">
              {/* 入职日期 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  入职日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="hire_date"
                  value={employee.hire_date || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 员工状态 */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  员工状态 <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={employee.status || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">请选择状态</option>
                  <option value="active">在职</option>
                  <option value="inactive">离职</option>
                  <option value="on_leave">请假</option>
                </select>
              </div>

              {/* 部门 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  部门 <span className="text-red-500">*</span>
                </label>
                <select
                  name="department_id"
                  value={employee.department_id || ''}
                  onChange={handleDepartmentChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="" disabled hidden>选择部门</option>
                  {departmentOptions.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 职位 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  职位 <span className="text-red-500">*</span>
                </label>
                <select
                  name="position_id"
                  value={employee.position_id || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="" disabled hidden>选择职位</option>
                  {positionOptions.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 角色等级 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  角色等级 <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={employee.role || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="" disabled hidden>请选择角色等级</option>
                  <option value="employee">普通员工</option>
                  <option value="manager">组长</option>
                  <option value="admin">主管</option>
                </select>
              </div>

              {/* 上级领导 */}
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">上级领导</label>
                <select
                  name="manager_id"
                  value={employee.manager_id || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">无</option>
                  {managerOptions.map(mgr => (
                    <option key={mgr.value} value={mgr.value}>
                      {mgr.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 是否试用期 */}
              <div className="md:col-span-2 flex items-end pb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_probation"
                    name="is_probation"
                    checked={!!employee.is_probation}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_probation" className="ml-2 block text-sm font-medium text-slate-700">
                    是否试用期
                  </label>
                </div>
              </div>
            </div>
          </fieldset>

          {/* 教育背景 */}
          <fieldset className="border-t border-slate-200 pt-6">
            <legend className="text-base font-semibold text-slate-900 mb-4">教育背景</legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">最高学历</label>
                <input
                  type="text"
                  name="education"
                  value={employee.education || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">毕业院校</label>
                <input
                  type="text"
                  name="university"
                  value={employee.university || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">专业</label>
                <input
                  type="text"
                  name="major"
                  value={employee.major || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">毕业日期</label>
                <input
                  type="date"
                  name="graduation_date"
                  value={employee.graduation_date || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </fieldset>

          {/* 薪资与绩效 */}
          <fieldset className="border-t border-slate-200 pt-6">
            <legend className="text-base font-semibold text-slate-900 mb-4">薪资与绩效</legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  底薪 (元) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="base_salary"
                  value={employee.base_salary || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">绩效薪资 (元)</label>
                <input
                  type="number"
                  step="0.01"
                  name="performance_salary"
                  value={employee.performance_salary || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">银行卡号</label>
                <input
                  type="text"
                  name="bank_account"
                  value={employee.bank_account || ''}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">工作绩效分 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="work_performance_score"
                  value={employee.work_performance_score || 0}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">考勤绩效分 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="attendance_performance_score"
                  value={employee.attendance_performance_score || 0}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </fieldset>

          {/* 提交按钮 */}
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-300 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 rounded-lg text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors"
            >
              {isNew ? '确认新增' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}