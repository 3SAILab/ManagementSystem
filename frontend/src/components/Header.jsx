// Header.jsx
import { useMatches } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UpdateModal } from './UpdateModal';
import NotificationPanel from './NotificationPanel';
import { useEmployeePermissionStore } from '../store/employee';

export default function Header() {
  const matches = useMatches();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false); // 避免重复检查
  const { employee } = useEmployeePermissionStore();

  // 找到有 title 的路由
  const matchWithTitle = matches.find(match => match.handle?.title);

  // 判断是否为生产部员工
  const isProductionStaff = employee.department_name === '生产部';

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
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 h-[var(--header-height)]">
        {/* 左侧：汉堡菜单按钮 */}
        <button
          id="menu-toggle"
          className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>

        {/* 中间：动态标题 */}
        <h2 className="text-2xl font-bold text-slate-800">
          {matchWithTitle?.handle.title || 'Dashboard'}
        </h2>

        {/* 右侧：操作区域 */}
        <div id="header-actions" className="flex items-center space-x-4">
          {/* 通知面板 - 仅生产部员工可见 */}
          {isProductionStaff && <NotificationPanel />}
          
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
        </div>
      </header>

      {/* 更新模态框 */}
      <UpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}