import React, { useEffect, useState } from 'react';
import { getSubTasks } from '../services/subTaskService';
import { getGroupMembersWithTaskCount } from '../services/authService';
import AssignWorkModal from '../components/AssignWorkModal';
import { assignSubTask } from '../services/subTaskService';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { useNotificationStore } from '../store/notifications';
import { Bell, AlertCircle } from 'lucide-react';

const WorkAssignmentPage = () => {
  const [tasks, setTasks] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isAssignWorkModalOpen, setIsAssignWorkModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  // 通知系统
  const { 
    contractNotifications, 
    clearNotification, 
    getTotalNotificationCount,
    hasNotifications 
  } = useNotificationStore();
  
  // 过滤条件
  const [filters, setFilters] = useState({
    key_word: '',
    status: [],
    task_type: '',
    page: 1,
    page_size: 20
  });
  // 状态选项
  const statusOptions = ['未分配', '未开始', '进行中'];
  // 总数量
  const [total, setTotal] = useState(0);
  // 状态徽章样式
  const statusBadgeClass = (status) => {
    switch (status) {
      case '未分配':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case '未开始':
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
      case '进行中':
        return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
    }
  };
  // 获取待分配工单和团队成员
  useEffect(() => {
    getSubTasks(filters).then((res) => {
      if (res.success) {
        setTasks(res.data.sub_tasks);
        setTotal(res.data.total);
      }
    });
    getGroupMembersWithTaskCount().then((res) => {
      if (res.success) {
        setGroupMembers(res.data);
      }
    });
  }, [filters]);


  // 切换状态选择
  const toggleStatus = (status) => {
    setFilters(prev => {
      if (prev.status.includes(status)) {
        return { ...prev, status: prev.status.filter(s => s !== status) };
      } else {
        return { ...prev, status: [...prev.status, status] };
      }
    });
  };

  // 分配任务
  const handleAssignSave = (task) => {
    assignSubTask(task).then((res) => {
      if (res.success) {
        toast.success('分配成功');
        // 刷新任务列表
        getSubTasks(filters).then((res) => {
          if (res.success) {
            setTasks(res.data.sub_tasks);
            setTotal(res.data.total);
          }
        });
        // 刷新团队成员列表
        getGroupMembersWithTaskCount().then((res) => {
          if (res.success) {
            setGroupMembers(res.data);
          }
        });
      }
    });
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-[calc(100vh-64px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">工单分配</h1>
        <p className="text-slate-500 mt-1">将工单任务分配给组员</p>
      </div>

      {/* 通知区域 */}
      {hasNotifications() && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-800 mb-1">⚠️ 合同需求更新通知</h3>
                <div className="space-y-2">
                  {contractNotifications.appendixContracts.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 mb-2">
                        发现 <span className="font-semibold text-orange-700">{contractNotifications.appendixContracts.length}</span> 个合同有新的附属合同，相关工单需求已更新：
                      </p>
                      <ul className="text-xs text-slate-700 space-y-1">
                        <li>• 工单需求数量已按主合同+附属合同聚合计算</li>
                        <li>• 请检查对应工单的备注信息获取详细变更内容</li>
                        <li>• 建议重新评估任务分配和完成时间</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {contractNotifications.appendixContracts.map(contractId => (
                <div
                  key={contractId}
                  className="flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs border border-orange-300"
                >
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1.5 animate-pulse"></span>
                  合同 #{contractId}
                  <button
                    onClick={() => clearNotification(contractId)}
                    className="ml-1 text-orange-600 hover:text-orange-800 hover:bg-orange-200 rounded-full w-4 h-4 flex items-center justify-center"
                    title="标记为已读"
                  >
                    ×
                  </button>
                </div>
              ))}
              {contractNotifications.appendixContracts.length > 1 && (
                <button
                  onClick={() => contractNotifications.appendixContracts.forEach(clearNotification)}
                  className="text-xs text-orange-600 hover:text-orange-800 underline ml-2"
                >
                  全部标记为已读
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 待分配工单 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* 搜索和状态筛选 */}
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="relative flex-1 min-w-[220px]">
                  <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.89 9.39l3.6 3.6a.75.75 0 1 0 1.06-1.06l-3.6-3.6A5.5 5.5 0 0 0 9 3.5Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="搜索工单、客户、负责人" 
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white/80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    value={filters.key_word}
                    onChange={(e) => setFilters({...filters, key_word: e.target.value})}
                  />
                </div>
                <div className="hidden md:block h-6 w-px bg-slate-200" />
                {/* 状态多选 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">状态</span>
                  <div className="inline-flex items-center rounded-full bg-slate-100 p-1 border border-slate-200">
                    {statusOptions.map((status) => (
                      <button 
                        key={status}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                          filters.status.includes(status)
                            ? 'bg-white text-indigo-600 border-indigo-500 shadow-sm'
                            : 'text-slate-700 border-transparent hover:text-slate-900'
                        }`}
                        onClick={() => toggleStatus(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* 任务列表 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-600">工单名称</th>
                    <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-600">客户</th>
                    <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-600">产品名称</th>
                    <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-600 whitespace-nowrap">微信群</th>
                    <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-600">销售</th>
                    <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-600">负责人</th>
                    <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-600">状态</th>
                    <th className="p-4 text-xs uppercase tracking-wider font-semibold text-slate-600 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tasks && tasks.length > 0 ? (
                    tasks.map((task) => {
                      return (
                        <tr key={task.id} className="hover:bg-slate-50/60">
                          <td className="p-4 font-medium text-slate-800 max-w-[240px] truncate">
                            {task.ticket.name}
                          </td>
                          <td className="p-4 text-slate-600 max-w-[180px] truncate">
                            {task.ticket.client.name}
                          </td>
                          <td className="p-4 text-slate-600 max-w-[180px] truncate">
                            {task.product_name || '-'}
                          </td>
                          <td className="p-4 text-slate-600 whitespace-nowrap">
                            {task.wechat_group || '-'}
                          </td>
                          <td className="p-4 text-slate-600 max-w-[140px] truncate">
                            {task.sales}
                          </td>
                          <td className="p-4 text-slate-600 max-w-[140px] truncate">
                            {task.charge_name || '-'}
                          </td>
                          <td className="p-4 text-slate-600">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusBadgeClass(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              className="assign-work-btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded-lg text-sm shadow-sm"
                              onClick={() => {
                                setIsAssignWorkModalOpen(true);
                                setSelectedTaskId(task.id);
                                setSelectedTicketId(task.ticket.id);
                              }}
                            >
                              分配任务
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center p-10 text-slate-500">
                        {tasks.length === 0 ? '当前没有需要分配的工单。' : '没有找到匹配的工单。'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* 分页组件 */}
            <div className="p-4 border-t border-slate-200 text-sm text-slate-600 flex justify-between items-center bg-slate-50/60">
              <span>显示 {tasks.length} / 共 {total} 条数据</span>
              <div className="flex items-center gap-2">
                {/* 分页按钮 */}
                <Pagination
                  totalItems={total}
                  itemsPerPage={filters.page_size}
                  currentPage={filters.page}
                  onPageChange={(page) => setFilters({...filters, page: page})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 团队成员工作负载 */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <h3 className="p-4 text-lg font-semibold text-slate-800 border-b bg-slate-50/60">
              团队成员工作负载
            </h3>
            <div className="p-4">
              {groupMembers && groupMembers.length > 0 ? (
                groupMembers.map((member) => {
                  return (
                    <div key={member.id} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{member.name}</span>
                        </div>
                        <span className="text-xs text-slate-500">{member.task_count} 个任务</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center p-4 text-slate-500">暂无团队成员信息。</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {isAssignWorkModalOpen && (
        <AssignWorkModal
          id={selectedTaskId}
          groupMembers={groupMembers}
          onClose={() => setIsAssignWorkModalOpen(false)}
          onSave={handleAssignSave}
        />
      )}
    </div>
  );
};

export default WorkAssignmentPage;