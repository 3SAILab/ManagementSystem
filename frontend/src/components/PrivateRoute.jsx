import { Navigate } from 'react-router-dom';
import { useEmployeePermissionStore } from '../store/employee';
import { menuItems } from '../config/menuConfig';

export default function PrivateRoute({ currentPath, children }) {
    console.log('PrivateRoute正常运行');
    const { employee } = useEmployeePermissionStore();
    //获取路径对应的权限
    const getAccessByPath = (path) => {
        const item = menuItems.find(item => item.path === path);
        return item ? item.access : undefined;
      };
    //判断是否有权限
    const hasAccess = (path) => {
        const access = getAccessByPath(path);
        if (!access) return true;
    
        const { roles, departments, positions } = access;
    
        const roleMatch = roles ? roles.includes(employee?.role) : true;
        const departmentMatch = departments ? departments.includes(employee?.department) : true;
        const positionMatch = positions ? positions.includes(employee?.position) : true;
    
        return roleMatch && departmentMatch && positionMatch;
    };
    console.log('PrivateRoute正常运行');
    if (!hasAccess(currentPath)) return <Navigate to="/login" replace />;
    //验证通过
    return children;
}