// components/OrderDetailsPanel.jsx
import { useEffect, useState } from 'react';
import { Clock, ShieldAlert, Flag, SlidersHorizontal, ArrowUpCircle, Calendar, Users, Shield } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import UpdateProgressCommentModal from './UpdateProgressCommentModal';
import { getSubTaskDetailById, updateSubTaskProgress } from '../../../../api/workorder/subtask';
import Avatar from './Avatar';
import { toast } from 'react-toastify';
import ModalCloseButton from './ModalCloseButton';

const DetailItem = ({ icon: Icon, label, children }) => (
  <div className="grid grid-cols-4 gap-4 py-3">
    <dt className="col-span-1 flex items-center gap-2 text-sm text-slate-500">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </dt>
    <dd className="col-span-3 text-sm text-slate-800 font-medium">{children}</dd>
  </div>
);

const OrderDetailsPanel = ({ orderId, onClose, onRefresh }) => {
  const [order, setOrder] = useState(null);
  const [progressList, setProgressList] = useState([]); // 更语义化的命名
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [relatedEmployees, setRelatedEmployees] = useState({});
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [pendingProgress, setPendingProgress] = useState(null);
  // 页面刷新
  const [refresh, setRefresh] = useState(false);
  // ✅ 安全初始化：不要依赖 order，而是用 ?. 和 ?? 提供默认值
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getSubTaskDetailById(orderId);
        if (res.data?.order) {
          setOrder(res.data.order);
          setProgressList(res.data.progress_log || []);
          // ✅ 获取数据后才设置 currentProgress，避免 null
          setCurrentProgress(res.data.order.progress ?? 0);
          setRelatedEmployees(res.data.related_employees || {});
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, refresh]);

  // 滑块变化监听
  const handleSliderInput = (e) => {
    const value = Number(e.target.value);
    setCurrentProgress(value);
    e.target.style.setProperty('--progress-percent', `${value}%`);
  };

  // 滑块结束拖动 → 打开备注弹窗
  const handleSliderChange = (e) => {
    const newProgress = Number(e.target.value);
    // ✅ 防止 order 为 null
    if (!order) return;
    if (newProgress !== order.progress) {
      setPendingProgress(newProgress);
      setShowProgressModal(true);
    }
  };

  // 取消更新 → 恢复原始值
  const handleCancelUpdate = () => {
    // ✅ 恢复原 progress，如果不存在则保持当前值
    setCurrentProgress(order?.progress ?? currentProgress);
    setShowProgressModal(false);
  };

  // 提交更新
  const handleSubmitUpdate = async (progressLog) => {
    progressLog.progress = pendingProgress;
    const res = await updateSubTaskProgress(progressLog);
    if (res.success) {
      toast.success('进度更新成功');
    } else {
      toast.error('进度更新失败');
    }
    setShowProgressModal(false);
    setRefresh(!refresh);
    onRefresh();
  };

  // ✅ 如果还在加载
  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose}></div>
        <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl z-50 flex items-center justify-center">
          <p className="text-slate-500">加载中...</p>
        </div>
      </>
    );
  }

  // ✅ 如果出错或找不到工单
  if (error || !order) {
    return (
      <>
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose}></div>
        <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl z-50 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-slate-500 mb-2">无法加载工单详情</p>
            <button
              onClick={onClose}
              className="text-indigo-600 text-sm font-semibold"
            >
              返回
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose}></div>

      {/* Side Panel */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 truncate">{order.ticket_name}</h2>
          <ModalCloseButton onClose={onClose} />
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Details List */}
          <dl className="divide-y divide-slate-100">
            <DetailItem icon={Clock} label="创建时间">
              {order.created_at
                ? new Date(order.created_at).toLocaleString()
                : '-'}
            </DetailItem>
            <DetailItem icon={MessageCircle} label="微信群">
              <a target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {order.wechat_group}
              </a>
            </DetailItem>
            <DetailItem 
              icon={Shield} 
              label="带水印"
              iconColor={order.need_watermark ? '#d97706' : '#16a34a'} // 橙黄 / 绿
            >
              <span className={`font-medium ${order.need_watermark 
                ? 'text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full text-sm' 
                : 'text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-sm'}`}>
                {order.need_watermark ? '是' : '否'}
              </span>
            </DetailItem>
            <DetailItem icon={ShieldAlert} label="预警状态">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                  order.warning === '红色预警'
                    ? 'bg-red-100 text-red-700'
                    : order.warning === '黄色预警'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {order.warning || '正常'}
              </span>
            </DetailItem>

            <DetailItem icon={Flag} label="状态">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {order.status || '-'}
              </span>
            </DetailItem>

            <DetailItem icon={SlidersHorizontal} label="进度">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentProgress}
                  onInput={handleSliderInput}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{ '--progress-percent': `${currentProgress}%` }}
                />
                <span className="font-bold text-indigo-600 w-12 text-center">
                  {currentProgress}%
                </span>
              </div>
            </DetailItem>

            <DetailItem icon={ArrowUpCircle} label="优先级">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {order.priority || '未设置'}
              </span>
            </DetailItem>

            <DetailItem icon={Calendar} label="开始时间">
              {order.started_at
                ? new Date(order.started_at).toLocaleString()
                : '-'}
            </DetailItem>
            <DetailItem icon={Calendar} label="完成时间">
              {order.completed_at
                ? new Date(order.completed_at).toLocaleString()
                : '-'}
            </DetailItem>
            <DetailItem icon={Users} label="负责人">
              <div className="flex items-center -space-x-2">
                {/** 将每个相关人员信息显示出来，以头像形式 */}
                <Avatar name={relatedEmployees.sales} />
                <Avatar name={relatedEmployees.art} />
                <Avatar name={relatedEmployees.render} />
              </div>
            </DetailItem>
          </dl>

          {/* 描述 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">项目描述</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {order.notes?.trim() ? order.notes : '暂无描述内容。'}
            </p>
          </div>

          {/* 动态 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">动态</h3>
            {Array.isArray(progressList) && progressList.length > 0 ? (
              <div className="space-y-6">
                {progressList.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <Avatar name={activity.name} size="md" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.name || '未知用户'}</span>
                        <span className="text-slate-700"> {activity.notes}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activity.created_at ? new Date(activity.created_at).toLocaleString() : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">暂无动态记录。</p>
            )}
          </div>
        </div>
      </div>

      {/* 条件渲染：仅当需要时显示更新进度模态框 */}
      {showProgressModal && (
        <UpdateProgressCommentModal
          ticketId={order.ticket_id}
          subTaskId={orderId}
          oldProgress={order.progress}
          newProgress={pendingProgress}
          onCancel={handleCancelUpdate}
          onSubmit={handleSubmitUpdate}
          onClose={() => setShowProgressModal(false)}
        />
      )}
    </>
  );
};

export default OrderDetailsPanel;