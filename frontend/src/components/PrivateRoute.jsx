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
    
    // 获取路径对应的权限
    const getAccessByPath = (path) => {
        for (const parent of menuItems) {
            if (parent.children) {
                const child = parent.children.find(child => child.path === path);
                if (child) {
                    return child.access || parent.access;
                }
            }
            if (parent.path === path) {
                return parent.access;
            }
        }
        return undefined;
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
    
    // 检查当前路径权限
    const currentAccess = getAccessByPath(currentPath);
    const hasCurrentPathAccess = checkAccess(currentAccess);
    
    // 如果没有当前路径权限，跳转到有权限的第一个页面
    if (!hasCurrentPathAccess) {
        const firstPath = getFirstAccessiblePath();
        return <Navigate to={firstPath} replace />;
    }
    
    return children;
}