import { Navigate } from 'react-router-dom';
import { useEmployeePermissionStore } from '../store/employee';
import { menuItems } from '../config/menuConfig';

export default function PrivateRoute({ currentPath, children }) {
    const { employee } = useEmployeePermissionStore();
    
    // 检查权限的辅助函数
    const checkAccess = (access) => {
        if (!access) return true;
        
        const { roles, departments, positions } = access;
        const roleMatch = roles ? roles.includes(employee?.role) : true;
        const departmentMatch = departments ? departments.includes(employee?.department_name) : true;
        const positionMatch = positions ? positions.includes(employee?.position_name) : true;
        
        return roleMatch && departmentMatch && positionMatch;
    };
    
    // 权限判断函数：如果没有 access 属性，默认允许访问
    const hasAccess = (item, access = item.access) => {
        if (!access) return true;

        const { roles, departments, positions } = access;
        // 用 department_id、position_id 或者把名称存入 Store
        return (roles ? roles.includes(employee.role) : true)
            && (departments ? departments.includes(employee.department_name) : true)
            && (positions ? positions.includes(employee.position_name) : true)
    };
    // 收集所有有权限的子菜单项
    const getAllChildrenMenuItems = () => {
        return menuItems.reduce((acc, parentItem) => {
        if (parentItem.children && Array.isArray(parentItem.children)) {
            parentItem.children.forEach(child => {
            const mergedAccess = child.access || parentItem.access;
            if (hasAccess(child, mergedAccess)) {
                acc.push(child);
            }
            });
        }
        return acc;
        }, []);
    };
    // 获取用户有权限的第一个页面
    const getFirstAccessiblePath = () => {
        for (const menuGroup of menuItems) {
            const groupAccess = checkAccess(menuGroup.access);
            if (groupAccess && menuGroup.children) {
                for (const child of menuGroup.children) {
                    const childAccess = checkAccess(child.access || menuGroup.access);
                    if (childAccess) {
                        return child.path;
                    }
                }
            }
        }
        return '/'; // 默认首页
    };
    
    // 检查当前路径是否在有权限的子菜单项中
    const hasCurrentPathAccess = getAllChildrenMenuItems().some(item => item.path === currentPath);
    
    // 如果没有当前路径权限，跳转到有权限的第一个页面
    if (!hasCurrentPathAccess) {
        const firstPath = getFirstAccessiblePath();
        return <Navigate to={firstPath} replace />;
    }
    
    return children;
}