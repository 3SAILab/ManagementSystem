import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { getClientInfo } from '../services/clientService';
import { getClientActivityLog } from '../services/clientActivityLogService';
import Avatar from './Avatar';

const ClientSidePanel = ({ clientId, refresh }) => {
  const [clientInfo, setClientInfo] = useState({
    name: '',
    contact_name: '',
    contact_phone: '',
    address: {
      province: '',
      city: '',
      district: '',
      street: '',
    },
    source: '',
    status: '',
  });
  const [clientActivityLogs, setClientActivityLogs] = useState(null);
  useEffect(() => {
    // 未选中客户时不请求
    if (clientId === null) {
      setClientInfo(null);
      return;
    }
    getClientInfo(clientId).then(res => {
      if (res.success) {
        setClientInfo(res.data);
      } else {
        setClientInfo(null);
      }
      getClientActivityLog(clientId).then(res => {
        if (res.success) {
          setClientActivityLogs(res.data ? res.data : []);
        } else {
          setClientActivityLogs(null);
        }
      });
    });
  }, [clientId, refresh]);

  return(!clientInfo?.name ? (
    <aside className="w-full max-w-md flex-shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col h-screen overflow-y-auto auto-hide-scrollbar">
      {/* Header */}
      <header className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-500">暂无数据</h3>
      </header>
  
      {/* 提示内容 */}
      <div className="flex-grow flex items-center justify-center p-6">
        <p className="text-center text-slate-500">请选择一个客户查看详情</p>
      </div>
    </aside>
  ) : (
    <aside className="w-full max-w-md flex-shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col h-screen overflow-y-auto auto-hide-scrollbar">
      {/* Header */}
      <header className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-bold">
          {clientInfo.name}
        </h3>
      </header>
  
      {/* 客户信息 */}
      <div className="p-4">
        <div className="bg-slate-50 p-4 rounded-xl shadow-sm border">
          <div className="font-semibold text-slate-700 mb-2">客户信息</div>
          <div className="text-sm space-y-1">
            <div>客户名称：{clientInfo?.name || '未知'}</div>
            <div>联系人：{clientInfo?.contact_name || '未知'}</div>
            <div>电话：{clientInfo?.contact_phone || '未知'}</div>
          </div>
        </div>
      </div>
  
      {/* 跟进记录 */}
      <div className="p-4 flex-grow">
        <div className="bg-white p-4">
          <div className="font-semibold text-slate-700 mb-2">跟进记录</div>
          {Array.isArray(clientActivityLogs) && clientActivityLogs.length === 0 ? (
            <div className="text-sm text-slate-500">暂无跟进记录</div>
          ) : (
            <div className="space-y-4">
              {clientActivityLogs?.map((activityLog, idx) => {
                // 时间格式化
                const timeStr = activityLog.log_time
                  ? new Date(activityLog.log_time).toLocaleString('zh-CN', { hour12: false })
                  : '';
                return (
                  <div
                    key={activityLog.id + activityLog.log_time + idx}
                    className="flex gap-3 items-start bg-slate-50 rounded-lg p-3 shadow-sm"
                  >
                    {/* 头像 */}
                    <Avatar
                      name={activityLog.sales_name || 'NA'}
                      size={40}
                    />
                    {/* 内容 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{activityLog.sales_name}</span>
                      </div>
                      {/* 状态 */}
                      {activityLog.status !== "更换负责人" && (
                        <div className=" text-slate-600 mt-1 text-base">将状态更新为：<span className="bg-indigo-100 px-2 py-0.5 rounded-md">{activityLog.status}</span></div>
                      )}
                      {activityLog.status === "更换负责人" && (
                        <div className=" text-slate-600 mt-1 text-base">将负责人更新为：<span className="bg-indigo-100 px-2 py-0.5 rounded-md">{activityLog.sales_name}</span></div>
                      )}
                      {/* 内容 */}
                      <div className="text-slate-700 mt-1">{activityLog.log_content}</div>
                      <div className="text-xs text-slate-400 mt-1">{timeStr}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  ))
};

export default ClientSidePanel;