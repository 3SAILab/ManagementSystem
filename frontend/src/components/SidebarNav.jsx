import React from 'react';
import { Link } from 'react-router-dom'; 
import { menuItems } from '../config/menuConfig';
import { useEmployeeStore } from '../store/employee';
import * as Icons from 'lucide-react';

function toPascalCase(str) {
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

const SidebarNav = () => {
  const { employee } = useEmployeeStore();

  // 权限判断函数：如果没有 access 属性，默认允许访问
  const hasAccess = (item) => {
    if (!item.access) return true;

    const { roles, departments, positions } = item.access;

    const roleMatch = roles ? roles.includes(employee?.role) : true;
    const departmentMatch = departments ? departments.includes(employee?.department) : true;
    const positionMatch = positions ? positions.includes(employee?.position) : true;

    return roleMatch && departmentMatch && positionMatch;
  };

  // 收集所有有权限的子菜单项
  const getAllChildrenMenuItems = () => {
    return menuItems.reduce((acc, parentItem) => {
      if (parentItem.children && Array.isArray(parentItem.children)) {
        parentItem.children.forEach(child => {
          if (hasAccess(child)) {
            acc.push(child);
          }
        });
      }
      return acc;
    }, []);
  };

  // 渲染子菜单项
  const renderMenuItems = () => {
    const items = getAllChildrenMenuItems();
    return items.map((item, index) => {
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