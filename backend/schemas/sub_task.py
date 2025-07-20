from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class SubTaskInfo(BaseModel):
    id: int
    ticket_id: int
    task_type: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    assignee_id: int
    assignee_name: Optional[str] = None
    charge_id: int
    charge_name: Optional[str] = None
    ticket_name: Optional[str] = None

    class Config:
        from_attributes = True

class SubTaskCreate(BaseModel):
    ticket_id: int
    task_type: str
    status: str



