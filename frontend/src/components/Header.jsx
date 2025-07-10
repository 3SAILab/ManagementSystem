export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 h-[var(--header-height)]">
      {/* 菜单切换按钮（移动端显示） */}
      <button
        id="menu-toggle"
        className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
      >
        <i data-lucide="menu" className="w-6 h-6"></i>
      </button>

      {/* 页面标题 */}
      <h2 id="page-title" className="text-2xl font-bold text-slate-800">
        {/* 页面标题内容由路由动态注入 */}
      </h2>

      {/* 右侧操作区域（如按钮、搜索等） */}
      <div id="header-actions">
        {/* 动态内容可由页面传入或根据路由决定 */}
      </div>
    </header>
  );
}