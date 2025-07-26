import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import EmployeeFormModal from '../components/EmployeeFormModal';
import { getDepartments } from '../services/departmentService';
import { getEmployeeList, addEmployee, updateEmployeeWorkInfo } from '../services/authService';
import { toast } from 'react-toastify';

export default function EmployeeManagementPage() {
  const [searchName, setSearchName] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  // 模态框相关
  const [isModalOpen, setIsModalOpen] = useState(false);
  //从 API 获取数据
  const [allEmployees, setAllEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employee_id, setEmployee_id] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const employees = await getEmployeeList();
      const departments = await getDepartments();
      if (employees.success && departments.success) {
        setDepartments(departments.data);
        setAllEmployees(employees.data);
      } else {
        toast.error("页面加载错误")
      }
    };

    fetchData();
  }, []);

  // 初始加载用户列表
  useEffect(() => {
    setFilteredUsers(allEmployees);
  }, [allEmployees]);

  // 应用筛选条件
  useEffect(() => {
    let result = [...allEmployees];

    if (searchName) {
      const lowerSearch = searchName.toLowerCase();
      result = result.filter(user => user.name.toLowerCase().includes(lowerSearch));
    }

    if (departmentFilter) {
      //将字符串转换为数字
      const departmentId = parseInt(departmentFilter);
      result = result.filter(user => user.department_id === departmentId);
    }

    setFilteredUsers(result);
  }, [searchName, departmentFilter, allEmployees]);

  const handleSave = async (employee) => {
    // 将表单数据转换为后端标准格式
    const payload = {
      name: employee.name,
      gender: employee.gender===''?null:employee.gender,
      email: employee.email,
      phone: employee.phone || undefined,
      birth_date: employee.birth_date || undefined,
      hire_date: employee.hire_date,
      department_id: Number(employee.department_id),
      position_id: Number(employee.position_id),
      manager_id: employee.manager_id ? Number(employee.manager_id) : undefined,
      base_salary: Number(employee.base_salary),
      work_performance_score: Number(employee.work_performance_score),
      attendance_performance_score: Number(employee.attendance_performance_score),
      is_probation: employee.is_probation,
      status: employee.status,
      role: employee.role,
      address: employee.address,
      emergency_contact: employee.emergency_contact,
      education: employee.education,
      university: employee.university,
      major: employee.major,
      graduation_date: employee.graduation_date || undefined,
      id_number: employee.id_number || undefined,
      marital_status: employee.marital_status || undefined,
      bank_account: employee.bank_account || undefined,
    };


    try {
      let response;
      if (employee_id) {
        // 编辑已有员工
        response = await updateEmployeeWorkInfo(employee_id, payload);
      } else {
        // 新增员工
        response = await addEmployee(payload);
      }
  
      if (response.success) {
        setIsModalOpen(false);
        toast.success('操作成功');
        const updatedEmployees = await getEmployeeList();
        setAllEmployees(updatedEmployees.data);
      } else {
        toast.error('操作失败');
        console.error('操作失败:', response.error);
      }
    } catch (error) {
      toast.error('操作失败');
      console.error('操作失败:', error);
      }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* 标题 + 新建按钮 */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        {/* 左侧标题 */}
        <h2 className="text-xl font-semibold text-slate-800">员工列表</h2>

        {/* 右侧筛选 + 按钮容器 */}
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
          {/* 部门下拉筛选 */}
          <div className="relative w-full sm:w-48">
            <select
              id="personnel-department-filter"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">所有部门</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* 姓名搜索框 */}
          <div className="relative w-full sm:w-64">
            <i className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">🔍</i>
            <input
              type="text"
              placeholder="按姓名搜索员工..."
              className="w-full pl-10 border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          {/* 新建员工按钮 */}
          <button
            onClick={() => {
              setEmployee_id(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors focus:outline-none whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> 新建员工
          </button>
        </div>
      </div>

      {/* 员工列表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm mt-4">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-slate-500 py-8">未找到相关员工。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">姓名</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">邮箱</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">职位</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map(user => {
                  const deptName = departments.find(d => d.id === user.department_id)?.name || '未知部门';
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-slate-200">
                            <svg className="h-full w-full text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </span>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{deptName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.position_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900" onClick={() => {
                          setIsModalOpen(true);
                          setEmployee_id(user.id);
                        }}>编辑</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <EmployeeFormModal isOpen={isModalOpen} id={employee_id} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
    </div>
  );
}