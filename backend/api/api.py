from fastapi import APIRouter

from backend.api.routes import employee
from backend.api.routes import position
from backend.api.routes import department
from backend.api.routes import client
from backend.api.routes import client_activity_log
from backend.api.routes import statistics
from backend.api.routes import contract
from backend.api.routes import ticket
from backend.api.routes import sub_task

api_router = APIRouter()

api_router.include_router(employee.router,tags=["员工管理"])
api_router.include_router(position.router,tags=["职位管理"])
api_router.include_router(department.router,tags=["部门管理"])
api_router.include_router(client.router,tags=["客户管理"])
api_router.include_router(client_activity_log.router,tags=["客户跟进记录"])
api_router.include_router(statistics.router,tags=["统计"])
api_router.include_router(contract.router,tags=["合同管理"])
api_router.include_router(ticket.router,tags=["工单管理"])
api_router.include_router(sub_task.router,tags=["子任务管理"])


