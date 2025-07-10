import React from 'react';
import { Link } from 'react-router-dom'; 
import { menuItems } from '../config/menuConfig';
import { useUserStore } from '../store/user';
import * as Icons from 'lucide-react';

function toPascalCase(str) {
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

const SidebarNav = () => {
  const { user } = useUserStore();

  // 权限判断函数
  const hasAccess = (item) => {
    if (!item.access) return true;

    const { roles, departments, positions } = item.access;

    const roleMatch = roles ? roles.includes(user?.role) : true;
    const departmentMatch = departments ? departments.includes(user?.department) : true;
    const positionMatch = positions ? positions.includes(user?.position) : true;

    return roleMatch && departmentMatch && positionMatch;
  };

  // 渲染所有有权限的一级菜单项
  const renderMenuItems = () => {
    return menuItems
      .filter(item => hasAccess(item))
      .map((item, index) => {
        const Icon = Icons[toPascalCase(item.icon)];
        return (
          <Link
            key={index}
            to={item.path}
            className="flex items-center p-2 text-slate-900 rounded-lg hover:bg-slate-100 group"
          >
            <Icon className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
            <span className="ms-3">{item.label}</span>
          </Link>
        );
      });
  };

  return (
    <nav className="space-y-2">
      {renderMenuItems()}
    </nav>
  );
};

export default SidebarNav;