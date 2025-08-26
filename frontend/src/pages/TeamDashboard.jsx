import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import OrderCard from '../components/OrderCard';
import OrderDetailsPanel from '../components/OrderDetailsPanel';
import Pagination from '../components/Pagination';
import { getTeamTasks } from '../services/subTaskService';
import { toast } from 'react-toastify';

const TeamDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [taskStatus, setTaskStatus] = useState({
    yellow_count: 0,
    red_count: 0,
    completed_count: 0,
    in_progress_count: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  // 过滤条件
  const [filters, setFilters] = useState({
    task_name: '',
    charge_name: '',
    page: 1,
    page_size: 20
  });
  // 总页数
  const [total, setTotal] = useState(0);
  // 页面刷新
  const [refresh, setRefresh] = useState(false);
  // 初始化页面数据
  useEffect(() => {
    getTeamTasks(filters).then((res) => {
      if(res.success){
        setOrders(res.data.sub_tasks);
        setTotal(res.data.total);
        setTaskStatus(res.data.task_status);
      }else{
        toast.error('页面加载失败，请刷新重试');
      }
    });
  }, [refresh, filters]);

  // 点击订单卡片显示有关任务详情，创建时间、预警状态、状态、进度、优先级、开始时间、标签、负责人
  const handleSelectOrder = (orderId) => {
    setSelectedOrder(orderId);
  };

  // 工单分类
  //未开始
  const unStartedOrders = orders.filter((o) => o.status === '未开始');
  //进行中
  const inProgressOrders = orders.filter((o) => o.status === '进行中');
  //已完成
  const completedOrders = orders.filter((o) => o.status === '已完成');

  return (
    <>
      <div className="w-full space-y-6 p-4 md:p-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <p className="text-sm text-slate-500">进行中工单</p>
            <p className="text-3xl font-bold text-slate-800">{taskStatus.in_progress_count}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <p className="text-sm text-slate-500">已完成工单</p>
            <p className="text-3xl font-bold text-slate-800">{taskStatus.completed_count}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <p className="text-sm text-slate-500">黄色预警</p>
            <p className="text-3xl font-bold text-yellow-500">{taskStatus.yellow_count}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <p className="text-sm text-slate-500">红色预警</p>
            <p className="text-3xl font-bold text-red-500">{taskStatus.red_count}</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
            {/* 按任务名称搜索 */}
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="搜索任务名称" 
                    className="form-input !pl-10 w-full bg-slate-50 border-slate-200"
                    value={filters.task_name}
                    onChange={(e) => setFilters({ ...filters, task_name: e.target.value })}
                />
            </div>
            {/* 按负责人名称搜索 */}
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="搜索负责人名称" 
                    className="form-input !pl-10 w-full bg-slate-50 border-slate-200"
                    value={filters.charge_name}
                    onChange={(e) => setFilters({ ...filters, charge_name: e.target.value })}
                />
            </div>
        </div>
        {/* 工单列表三栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* 未开始 */}
          <div className="bg-white/50 rounded-xl flex flex-col border border-slate-200 h-max">
            <h3 className="font-bold text-slate-800 p-4 border-b">
              未开始 ({unStartedOrders.length})
            </h3>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {unStartedOrders.length > 0 ? (
                unStartedOrders.map((order) => (
                  <OrderCard
                    key={order.sub_task_id}
                    subTaskId={order.sub_task_id}
                    ticketName={order.name}
                    progress={order.progress}
                    warning={order.warning}
                    clientName={order.client_name}
                    estimatedCompletionTime={order.estimated_completion_time}
                    chargeName={order.charge_name}
                    need_watermark={order.need_watermark}
                    onClick={() => handleSelectOrder(order.sub_task_id)}
                  />
                ))
              ) : (
                <p className="text-slate-500 text-sm p-2">暂无工单</p>
              )}
            </div>
          </div>

          {/* 进行中 */}
          <div className="bg-white/50 rounded-xl flex flex-col border border-slate-200 h-max">
            <h3 className="font-bold text-slate-800 p-4 border-b">
              进行中 ({inProgressOrders.length})
            </h3>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {inProgressOrders.length > 0 ? (
                inProgressOrders.map((order) => (
                  <OrderCard
                    key={order.sub_task_id}
                    subTaskId={order.sub_task_id}
                    ticketName={order.name}
                    progress={order.progress}
                    warning={order.warning}
                    clientName={order.client_name}
                    estimatedCompletionTime={order.estimated_completion_time}
                    chargeName={order.charge_name}
                    need_watermark={order.need_watermark}
                    onClick={() => handleSelectOrder(order.sub_task_id)}
                  />
                ))
              ) : (
                <p className="text-slate-500 text-sm p-2">暂无工单</p>
              )}
            </div>
          </div>

          {/* 已完成 */}
          <div className="bg-white/50 rounded-xl flex flex-col border border-slate-200 h-max">
            <h3 className="font-bold text-slate-800 p-4 border-b">
              已完成 ({completedOrders.length})
            </h3>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {completedOrders.length > 0 ? (
                completedOrders.map((order) => (
                  <OrderCard
                    key={order.sub_task_id}
                    subTaskId={order.sub_task_id}
                    ticketName={order.name}
                    progress={order.progress}
                    warning={order.warning}
                    clientName={order.client_name}
                    estimatedCompletionTime={order.estimated_completion_time}
                    chargeName={order.charge_name}
                    need_watermark={order.need_watermark}
                    onClick={() => handleSelectOrder(order.sub_task_id)}
                  />
                ))
              ) : (
                <p className="text-slate-500 text-sm p-2">暂无工单</p>
              )}
            </div>
          </div>
        </div>
        {/* 分页组件 */}
        <div className="p-4 border-t border-slate-200 text-sm text-slate-600 flex justify-between items-center">
          <span>显示 {orders.length} / 共 {total} 条数据</span>
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
      {selectedOrder !== null && (
        <OrderDetailsPanel
          orderId={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onRefresh={() => setRefresh(!refresh)}
        />
      )}
    </>
  );
};

export default TeamDashboardPage;