from backend.api.routes.employee import get_current_employee
from fastapi import Depends, HTTPException

# 验证角色
def require_roles(*allowed_roles):
    async def checker(current = Depends(get_current_employee)):
        if current.role.value not in allowed_roles:
            raise HTTPException(status_code=403, detail="权限不足")
        return current
    return checker

# 验证权限
LEVEL = {"employee": 1, "manager": 2, "admin": 3, "owner": 4}
def require_level_at_least(min_role: str):
    async def checker(current = Depends(get_current_employee)):
        if LEVEL[current.role.value] < LEVEL[min_role]:
            raise HTTPException(403, "权限不足")
        return current
    return checker

# 验证部门
def require_departments(*dept_names):
    async def checker(current = Depends(get_current_employee)):
        if current.department.name not in dept_names:
            raise HTTPException(403, "仅限指定部门")
        return current
    return checker

# 验证职位
def require_positions(*pos_names):
    async def checker(current = Depends(get_current_employee)):
        if current.position.name not in pos_names:
            raise HTTPException(403, "仅限指定职位")
        return current
    return checker


# 验证任意一个
def any_of(*deps):
    async def checker(current = Depends(get_current_employee)):
        for dep in deps:
            try:
                # 每个dep都是一个checker函数，直接调用它
                result = await dep(current)
                return result
            except HTTPException:
                continue
        raise HTTPException(status_code=403, detail="权限不足")
    return checker