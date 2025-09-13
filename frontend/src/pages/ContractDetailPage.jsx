import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContractDetail } from '../services/contractService';
import { addTicket, getTicketsByContractId, updateTicketInfo, deleteTicket } from '../services/ticketService';
import { getSubTasksByTicketId } from '../services/subTaskService';
import AddTicketModal from '../components/AddTicketModal';
import { ChevronLeft, Plus, Edit, Trash } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import SubTaskTable from '../components/SubTaskTable';
import EditTicketModal from '../components/EditTicketModal';
import { useEmployeePermissionStore } from '../store/employee';

const ContractDetailPage = () => {
  const { employee } = useEmployeePermissionStore();
  // 创建工单模态框是否显示
  const [createOrderModal, setCreateOrderModal] = useState(false);
  const { id } = useParams();
  // 合同详情数据
  const [contractData, setContractData] = useState({
    pendingDetails: { detailPage: 0, video: 0, image: 0, workflow: 0 },
    completedDetails: { detailPage: 0, video: 0, image: 0, workflow: 0 },
    yellowCount: 0,
    redCount: 0,
  });
  // 工单列表
  const [tickets, setTickets] = useState([]);
  // 是否显示编辑工单模态框
  const [editTicketModal, setEditTicketModal] = useState(false);
  // 选中的工单id
  const [ticketId, setTicketId] = useState(null);
  // 缓存所有工单的子任务数据
  const [subTasks, setSubTasks] = useState({});
  // 根据合同id刷新页面
  const init = useCallback(() => {
    getContractDetail(id).then(res => {
      setContractData({
        pendingDetails: res.pending_details,
        completedDetails: res.completed_details,
        yellowCount: res.yellow_count,
        redCount: res.red_count,
        artTasks: res.art_tasks,
        renderTasks: res.render_tasks,
      });
    }).catch(err => {
      console.error(err);
      toast.error("加载合同详情失败");
    });
    getTicketsByContractId(id).then(res => {
      setTickets(res.data);
    }).catch(err => {
      console.error(err);
      toast.error("加载工单列表失败");
    });
  }, [id]);

  useEffect(() => {
    init();
  }, [init]);
  // 选中的工单id
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  // 👇 新增：切换展开状态并获取合同数据的函数
  const toggleExpand = async (ticketId) => {
    // 如果点击的是同一个客户，则收起
    if (expandedTicketId === ticketId) {
        setExpandedTicketId(null);
        return;
    }

    // 设置为展开状态
    setExpandedTicketId(ticketId);

    // 如果这个工单的数据还没有加载过，则去获取
    if (!subTasks[ticketId]) {
        const res = await getSubTasksByTicketId(ticketId);
        if (res.success) {
            // 将获取到的合同数据存入 state
            setSubTasks(prev => ({
                ...prev,
                [ticketId]: res.data
            }));
        } else {
            // 获取失败，也存入一个空数组，避免重复请求
            setSubTasks(prev => ({
                ...prev,
                [ticketId]: []
            }));
            toast.error(res.message || '获取合同列表失败');
        }
    }
  }
  // 计算待完成和已完成的总数
  const pendingTotal = Object.values(contractData.pendingDetails).reduce((sum, count) => sum + count, 0);
  const completedTotal = Object.values(contractData.completedDetails).reduce((sum, count) => sum + count, 0);

  // 处理工单创建
  const handleAddTicket = async (ticketData) => {
    try {
      // 确保合同ID正确设置
      const ticketWithContractId = {
        ...ticketData,
        contract_id: parseInt(id)
      };

      const result = await addTicket(ticketWithContractId);
      if (result.success) {
        // 关闭模态框
        toast.success('创建工单成功');
        init();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('创建工单失败，请重试');
    }
  };
  // 处理工单编辑
  const handleEditTicket = async (ticketData) => {
    try {
      const result = await updateTicketInfo(ticketId, ticketData);
      if (result.success) {
        toast.success('编辑工单成功');
        init();
      } else {
        toast.error('编辑工单失败，请重试');
      }
    } catch (err) {
      console.error(err);
      toast.error('编辑工单失败，请重试');
    }
  }
  // 处理工单删除
  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      text: `确定要删除吗？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    });
    if (!result.isConfirmed) return;
  
    const res = await deleteTicket(ticketId);
    if (res.success) {
      toast.success('删除工单成功');
      init();
      setExpandedTicketId(null);
    } else {
      toast.error('删除工单失败，请重试');
    }
  };
  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="p-4 flex justify-between items-center gap-4">
        {/* 返回按钮 */}
        <Link
          to="/sales_dashboard"
          className="flex items-center text-gray-500 hover:text-gray-700 group text-lg"
        >
          {/* 使用 lucide-react 的 ChevronLeft 图标 */}
          <ChevronLeft
            className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200"
          />
          <span className="text-lg font-medium">返回销售看板</span>
        </Link>
        {/* 创建工单按钮 - 仅生产部门可见 */}
        {employee.department_name === '生产部' && (
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            onClick={() => {
              setCreateOrderModal(true);
            }}
          >
            <Plus className="w-4 h-4" /> 创建工单
          </button>
        )}

      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 待开始 */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            {/* 左侧：title 和 count */}
            <div>
              <h2 className="text-lg font-bold">待完成</h2>
              <div className={`text-gray-500 text-4xl font-bold mt-2`}>{pendingTotal}</div>
            </div>
            {/* 右侧：ul 列表 */}
            <ul className="mt-4 text-sm">
              <li>详情页：{contractData.pendingDetails.detailPage}</li>
              <li>视频：{contractData.pendingDetails.video}</li>
              <li>图片：{contractData.pendingDetails.image}</li>
              <li>工作流：{contractData.pendingDetails.workflow}</li>
            </ul>
          </div>
        </div>

        {/* 已完成 */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            {/* 左侧：title 和 count */}
            <div>
              <h2 className="text-lg font-bold">已完成</h2>
              <div className={`text-green-500 text-4xl font-bold mt-2`}>{completedTotal}</div>
            </div>

            {/* 右侧：ul 列表 */}
            <ul className="mt-4 text-sm">
              <li>详情页：{contractData.completedDetails.detailPage}</li>
              <li>视频：{contractData.completedDetails.video}</li>
              <li>图片：{contractData.completedDetails.image}</li>
              <li>工作流：{contractData.completedDetails.workflow}</li>
            </ul>
          </div>
        </div>

        {/* 黄色预警 */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-lg font-bold">黄色预警</h2>
          <div className={`text-yellow-500 text-4xl font-bold mt-2`}>{contractData.yellowCount}</div>
        </div>
        {/* 红色预警 */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-lg font-bold">红色预警</h2>
          <div className={`text-red-500 text-4xl font-bold mt-2`}>{contractData.redCount}</div>
        </div>
      </div>
      {/* 主内容区域 */}
      <div className="flex-grow flex gap-6 p-0 min-h-0">
        {/* 工单列表 */}
        <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border overflow-visible min-h-0">
          {/* 表格主体 */}
          <div className="flex-grow overflow-y-auto px-4">
            {tickets.length <= 0 ? (
              <div className="flex-grow flex items-center justify-center p-6">
                <p className="text-center text-slate-500">暂无数据</p>
              </div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto"> {/* 添加滚动条支持 */}
                <table className="min-w-full w-full">
                  {/* 表头 */}
                  <thead>
                    <tr>
                      <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">工单名称</th>
                      <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">创建时间</th>
                      <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">详情页</th>
                      <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">视频</th>
                      <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">图片</th>
                      <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">工作流</th>
                      <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                      <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">操作按钮</th>
                    </tr>
                  </thead>
                  {/* 表体 */}
                  <tbody className="bg-white divide-y divide-slate-200">
                    {tickets.map((ticket) => (
                      <React.Fragment key={ticket.id}>
                        {/* 👇 工单信息行 */}
                        <tr
                          onClick={() => {
                            toggleExpand(ticket.id);
                          }}
                          className={`hover:bg-slate-50 cursor-pointer ${expandedTicketId === ticket.id ? 'bg-slate-100' : ''}`}
                        >
                          <td className="p-4 text-sm font-semibold text-slate-700">{ticket.name}</td>
                          <td className="p-4 text-sm text-slate-500">
                            {new Date(ticket.created_at).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {ticket.detail_pages}
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {ticket.video_count}
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {ticket.image_count}
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {ticket.workflow_count}
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {ticket.status}
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            <button
                              type="button"
                              className="text-slate-500 hover:text-slate-700"
                              onClick={(e) => {
                                // ❗️阻止事件冒泡到 tr 的 onClick
                                e.stopPropagation();
                                setEditTicketModal(true);
                                setTicketId(ticket.id);
                              }}
                              title="编辑工单信息"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              className="text-slate-500 hover:text-slate-700"
                              onClick={(e) => {
                                // ❗️阻止事件冒泡到 tr 的 onClick
                                e.stopPropagation();
                                handleDeleteTicket(ticket.id);
                              }}
                              title="删除工单"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>

                        {/* 👇 子任务列表行 (仅在展开时显示) */}
                        {expandedTicketId === ticket.id && (
                          <tr className="w-full">
                            <td colSpan="7" className="p-0">
                              <div className="w-full bg-slate-50 border-t border-slate-200 my-1 rounded-lg overflow-hidden">
                                <div className="p-3 border-b border-slate-200 bg-slate-100">
                                  <h4 className="text-sm font-semibold text-slate-700">合同列表</h4>
                                </div>
                                <SubTaskTable subTasks={subTasks[ticket.id]} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 创建工单模态框 */}
      <AddTicketModal
        isOpen={createOrderModal}
        onClose={() => setCreateOrderModal(false)}
        onAdd={handleAddTicket}
        contractId={parseInt(id)}
      />
      {/* 编辑工单模态框 */}
      <EditTicketModal
        isOpen={editTicketModal}
        onClose={() => setEditTicketModal(false)}
        onEdit={handleEditTicket}
        ticketId={ticketId}
        contractId={parseInt(id)}
      />
    </div>
  );
};

export default ContractDetailPage;
