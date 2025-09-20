import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '../store/notifications';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const {
    contractNotifications,
    clearNotification,
    clearAllNotifications,
    updateLastChecked,
    getTotalNotificationCount,
    hasNotifications
  } = useNotificationStore();

  const totalCount = getTotalNotificationCount();

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && 
          !panelRef.current.contains(event.target) &&
          !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleTogglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      updateLastChecked();
    }
  };

  const handleNotificationClick = (contractId, type) => {
    clearNotification(contractId);
    navigate('/workorder/contract/management');
    setIsOpen(false);
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  return (
    <div className="relative">
      {/* 通知按钮 */}
      <button
        ref={buttonRef}
        onClick={handleTogglePanel}
        className={`relative p-2 rounded-full transition-colors ${
          hasNotifications() 
            ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`}
        title="通知"
      >
        <Bell className="w-5 h-5" />
        
        {/* 通知数量标志 */}
        {totalCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
            {totalCount > 99 ? '99+' : totalCount}
          </div>
        )}
      </button>

      {/* 通知面板 */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-hidden"
        >
          {/* 面板头部 */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">通知</h3>
            {hasNotifications() && (
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                全部清除
              </button>
            )}
          </div>

          {/* 通知列表 */}
          <div className="max-h-80 overflow-y-auto">
            {!hasNotifications() ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">暂无新通知</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* 新合同通知 */}
                {contractNotifications.newContracts.map(contractId => (
                  <div
                    key={`new-${contractId}`}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleNotificationClick(contractId, 'new')}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          新合同待处理
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          合同 #{contractId} 需要创建工单
                        </p>
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                          新合同
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(contractId);
                        }}
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* 附属合同通知 */}
                {contractNotifications.appendixContracts.map(contractId => (
                  <div
                    key={`appendix-${contractId}`}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleNotificationClick(contractId, 'appendix')}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          合同有新追加
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          合同 #{contractId} 有附属合同需要处理
                        </p>
                        <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full mt-1">
                          追加合同
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(contractId);
                        }}
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 面板底部 */}
          {hasNotifications() && (
            <div className="p-3 border-t border-slate-200">
              <button
                onClick={() => {
                  navigate('/workorder/contract/management');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                查看所有合同
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;