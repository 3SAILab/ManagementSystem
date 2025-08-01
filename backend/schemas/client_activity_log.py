from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClientActivityLogCreate(BaseModel):
    client_id: int
    log_content: Optional[str] = None
    status: Optional[str] = None
    log_time: datetime

class ClientActivityLogInfo(BaseModel):
    id: int
    client_id: int
    sales_id: int
    status: str
    log_content: str
    log_time: datetime
    sales_name: str


