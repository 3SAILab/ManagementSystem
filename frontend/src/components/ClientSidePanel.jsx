import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { getClientInfo } from '../services/clientService';
import { getClientActivityLog } from '../services/clientActivityLogService';

const ClientSidePanel = ({ clientId }) => {
  const [clientInfo, setClientInfo] = useState(null);
  const [clientActivityLogs, setClientActivityLogs] = useState(null);
  useEffect(() => {
    getClientInfo(clientId).then(res => {
      if (res.success) {
        setClientInfo(res.data);
      }else{
        setClientInfo(null);
      }
    });
    getClientActivityLog(clientId).then(res => {
      if (res.success) {
        setClientActivityLogs(res.data);
      }else{
        setClientActivityLogs(null);
      }
    });
  }, [clientId]);

  return(!clientInfo?.clientId ? (
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
          #{clientInfo.clientId.replace('client_', '')} {clientInfo.name || clientInfo.clientName}
        </h3>
      </header>
  
      {/* 客户信息 */}
      <div className="p-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="font-semibold text-slate-700 mb-2">客户信息</div>
          <div className="text-sm space-y-1">
            <div>客户名称：{clientInfo?.clientName || clientInfo?.name || '未知'}</div>
            <div>联系人：{clientInfo?.contactName || '未知'}</div>
            <div>电话：{clientInfo?.contactPhone || '未知'}</div>
          </div>
        </div>
      </div>
  
      {/* 跟进记录 */}
      <div className="p-4 flex-grow">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="font-semibold text-slate-700 mb-2">跟进记录</div>
          <div className="space-y-4">
            {clientActivityLogs.map((activityLog) => (
              <div key={activityLog.id + activityLog.timestamp} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                  {activityLog.initials}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-700">{activityLog.name}</p>
                  <p className="text-slate-600 mt-1">{activityLog.content}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(activityLog.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  ))
};

export default ClientSidePanel;