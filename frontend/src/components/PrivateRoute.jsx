import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/user';

export default function PrivateRoute({ currentPath, children }) {
    
    const { user } = useUserStore();
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
    
        const roleMatch = roles ? roles.includes(user?.role) : true;
        const departmentMatch = departments ? departments.includes(user?.department) : true;
        const positionMatch = positions ? positions.includes(user?.position) : true;
    
        return roleMatch && departmentMatch && positionMatch;
    };
    console.log('PrivateRoute正常运行');
    //token验证
    const token = useUserStore.getState().token;
    //权限验证
    function checkAccess(access) {
        if (!access) return true;
        const { roles, departments, positions } = access;
        return roles.includes(user?.role) && departments.includes(user?.department) && positions.includes(user?.position);
    }
    
    if (!token) {
        console.log('没有token，跳转到登录页面');
        return <Navigate to="/login" replace />;
    }
    if (!hasAccess(currentPath)) return <Navigate to="/login" replace />;
    //验证通过
    return children;
}