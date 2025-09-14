// Header.jsx
import { useMatches } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UpdateModal } from './UpdateModal';
import NotificationPanel from './NotificationPanel';
import { useEmployeePermissionStore } from '../store/employee';
import { useNotificationStore } from '../store/notifications';
import { getAppendixContractNotifications } from '../services/contractService';

export default function Header() {
  const matches = useMatches();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false); // 避免重复检查
  const { employee } = useEmployeePermissionStore();
  const { addAppendixContractNotification } = useNotificationStore();

  // 找到有 title 的路由
  const matchWithTitle = matches.find(match => match.handle?.title);

  // 判断是否需要检查附属合同通知
  const shouldCheckAppendixNotifications = employee && (
    employee.department_name === '生产部' || // 生产部需要附属合同通知
    employee.role === 'manager' || // 管理层需要所有通知
    employee.role === 'admin' // 管理员需要所有通知
  );

  // 检查附属合同通知
  useEffect(() => {
    async function checkAppendixContractNotifications() {
      if (!shouldCheckAppendixNotifications || hasChecked) return;
      
      try {
        console.log('检查附属合同通知...');
        const result = await getAppendixContractNotifications();
        if (result.success && result.data.appendix_contracts) {
          // 将检查到的合同ID添加到通知状态中
          result.data.appendix_contracts.forEach(contractId => {
            addAppendixContractNotification(contractId);
          });
          console.log(`检查到 ${result.data.count} 个附属合同通知`);
        }
      } catch (error) {
        console.error('检查附属合同通知失败:', error);
      } finally {
        setHasChecked(true);
      }
    }

    // 延迟检查，确保员工信息已加载
    if (employee?.department_name) {
      checkAppendixContractNotifications();
    }
  }, [shouldCheckAppendixNotifications, hasChecked, employee, addAppendixContractNotification]);

  // 检查更新
  useEffect(() => {
    async function checkForUpdate() {
      try {
        const response = await fetch('/updates/update.md?t=' + Date.now(), {
          method: 'HEAD',
        });

        const lastModified = response.headers.get('Last-Modified');
        const lastSeen = localStorage.getItem('lastSeenUpdateTimestamp');

        if (lastModified && lastSeen !== lastModified) {
          // 有新更新，首次进入时弹出
          setIsModalOpen(true);
          localStorage.setItem('lastSeenUpdateTimestamp', lastModified);
        }
      } catch (err) {
        console.warn('检查更新失败', err);
      } finally {
        setHasChecked(true);
      }
    }

    if (!hasChecked) {
      checkForUpdate();
    }
  }, [hasChecked]);

  return (
    <>
      {/* 更新模态框 */}
      <UpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      {/* 更新日志按钮 */}
      <button
        className="flex items-center space-x-2 p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        onClick={() => setIsModalOpen(true)}
        title="查看更新日志"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span className="hidden sm:inline text-sm font-medium">更新日志</span>
      </button>
    </>
  );
}