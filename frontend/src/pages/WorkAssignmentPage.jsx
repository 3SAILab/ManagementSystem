import React, { useEffect, useState } from 'react';
import { getSubTasks } from '../services/subTaskService';
import { getGroupMembersWithTaskCount } from '../services/authService';
import AssignWorkModal from '../components/AssignWorkModal';
import { assignSubTask } from '../services/subTaskService';
import { toast } from 'react-toastify';
const WorkAssignmentPage = () => {
  const [tasks, setTasks] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isAssignWorkModalOpen, setIsAssignWorkModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  // 获取待分配工单和团队成员
  useEffect(() => {
    getSubTasks().then((res) => {
      if (res.success) {
        setTasks(res.data);
      }
    });
    getGroupMembersWithTaskCount().then((res) => {
      if (res.success) {
        setGroupMembers(res.data);
      }
    });
  }, []);
  // 分配任务
  const handleAssignSave = (task) => {
    assignSubTask(task).then((res) => {
      if (res.success) {
        toast.success('分配成功');
        // 刷新任务列表
        getSubTasks().then((res) => {
          if (res.success) {
            setTasks(res.data);
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">工单分配</h1>
        <p className="text-slate-500 mt-1">将工单任务分配给组员</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 待分配工单 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <h3 className="p-4 text-lg font-semibold text-slate-800 border-b">待分配工单</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-slate-600">工单名称</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">客户</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">创建时间</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">销售</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">负责人</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">状态</th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tasks && tasks.length > 0 ? (
                    tasks.map((task) => {

                      return (
                        <tr key={task.id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-800">
                            {task.ticket.name}
                          </td>
                          <td className="p-4 text-slate-600">
                            {task.ticket.client.name}
                          </td>
                          <td className="p-4 text-slate-600">
                            {new Date(task.created_at).toLocaleString()}
                          </td>
                          <td className="p-4 text-slate-600">
                            {task.sales}
                          </td>
                          <td className="p-4 text-slate-600">
                            {task.charge_name || '-'}
                          </td>
                          <td className="p-4 text-slate-600">
                            {task.status}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              className="assign-work-btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-lg text-sm"
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
                      <td colSpan="5" className="text-center p-6 text-slate-500">
                        当前没有需要分配的工单。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 团队成员工作负载 */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <h3 className="p-4 text-lg font-semibold text-slate-800 border-b">
              团队成员工作负载
            </h3>
            <div className="p-4">
              {groupMembers && groupMembers.length > 0 ? (
                groupMembers.map((member) => {
                  return (
                    <div key={member.id} className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{member.name}</span>
                        </div>
                        <span className="text-sm text-slate-500">{member.task_count} 个任务</span>
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