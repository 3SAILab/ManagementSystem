import { useMatches } from 'react-router-dom';

export default function Header() {
  const matches = useMatches();
  
  // 找到有 title 的路由
  const matchWithTitle = matches.find(match => match.handle?.title);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 h-[var(--header-height)]">
      {/* 左侧：汉堡菜单按钮（仅在 lg 以下显示） */}
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

      {/* 右侧：操作区域（可自定义内容） */}
      <div id="header-actions" className="flex items-center space-x-4">
        {/* 示例：用户头像或通知图标 */}
        <button className="p-2 rounded-full text-slate-600 hover:bg-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h12s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-sm font-medium text-slate-700">
          U
        </div>
      </div>
    </header>
  );
}