import React from 'react';
import { useEmployeePermissionStore } from '../store/employee';
import SidebarNav from './SidebarNav';
import Header from './Header';
import { Outlet, useNavigate } from 'react-router-dom';
import { BrainCircuit, Menu, Settings2, LogOut } from 'lucide-react';
import { logout } from '../services/authService';
import { setApiNavigate } from '../services/api';

export default function Layout() {

  const navigate = useNavigate();

  React.useEffect(() => {
    setApiNavigate(navigate);
  }, [navigate]);

  const { employee } = useEmployeePermissionStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div id="app-view" className="h-screen flex">
      {/* 侧边栏 */}
      <aside id="sidebar" className="sidebar bg-white fixed top-0 left-0 h-full lg:flex flex-col w-64 z-20 shadow-sm">
        <div className="flex items-center gap-3 justify-center p-4 h-[var(--header-height)]">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-wider">SIGMA AI</h1>
        </div>

        {/* 导航菜单 */}
        <nav id="sidebar-nav" className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarNav />
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-slate-200">
          <div id="user-info" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#e9d5ff', color: '#581c87' }} title={employee?.name}>
                {employee?.name?.slice(-2) || '用户'.slice(-2)}
              </div>
              <span className="text-sm text-slate-700">{employee?.name || '用户'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button id="edit-profile-btn" className="text-slate-500 hover:text-indigo-600" title="个人中心">
                <Settings2 className="w-4 h-4" />
              </button>
              <button id="logout-btn" className="text-slate-500 hover:text-red-600" title="退出登录" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容 */}
      <main id="main-content" className="flex-1 flex flex-col overflow-y-auto ml-0 lg:ml-64">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 h-[var(--header-height)]">
          <button id="menu-toggle" className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100">
            <Menu className="w-6 h-6" />
          </button>
          <h2 id="page-title" className="text-2xl font-bold text-slate-800">
            <Header />
          </h2>
          <div id="header-actions"></div>
        </header>

        <div id="app" className="p-6 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}