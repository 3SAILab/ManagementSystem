from pydantic import BaseModel

from datetime import datetime

class ClientActivityLogCreate(BaseModel):
    client_id: int
    content: str
    status: str
    created_at: datetime

