from backend.schemas.client_activity_log import ClientActivityLogCreate
from sqlalchemy.ext.asyncio import AsyncSession

class ClientActivityLogService:
    @staticmethod
    async def add_client_activity_log(db: AsyncSession, client_activity_log: ClientActivityLogCreate):
        pass


