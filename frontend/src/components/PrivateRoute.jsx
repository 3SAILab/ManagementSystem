import { Navigate } from 'react-router-dom';
import { useEmployeePermissionStore } from '../store/employee';
import { menuItems } from '../config/menuConfig';

export default function PrivateRoute({ currentPath, children }) {
    console.log('PrivateRoute正常运行');
    const { employee } = useEmployeePermissionStore();
    //获取路径对应的权限
    const getAccessByPath = (path) => {
        // 遍历父菜单和子菜单，寻找匹配的 path，并合并 access
        for (const parent of menuItems) {
            if (parent.children) {
                const child = parent.children.find(child => child.path === path);
                if (child) {
                    return child.access || parent.access;
                }
            }
            // 如果父菜单本身有 path
            if (parent.path === path) {
                return parent.access;
            }
        }
        return undefined;
    };
    //判断是否有权限
    const hasAccess = (path) => {
        const access = getAccessByPath(path);
        if (!access) return true;
        
        const { roles, departments, positions } = access;
        const roleMatch = roles ? roles.includes(employee?.role) : true;
        const departmentMatch = departments ? departments.includes(employee?.department_name) : true;
        const positionMatch = positions ? positions.includes(employee?.position_name) : true;
    
        return roleMatch && departmentMatch && positionMatch;
    };
    if (!hasAccess(currentPath)) return <Navigate to="/login" replace />;
    //验证通过
    return children;
}