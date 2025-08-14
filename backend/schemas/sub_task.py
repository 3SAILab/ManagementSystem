from typing import Optional, List
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


class SubTaskUpdate(BaseModel):
    charge_id: Optional[int] = None
    assignee_id: Optional[int] = None
    charge_id: Optional[str] = None
    progress: Optional[int] = None
    assignee_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: Optional[str] = None


class SubTaskFilter(BaseModel):
    task_name: Optional[str] = None
    charge_name: Optional[str] = None
    key_word: Optional[str] = None
    task_type: Optional[str] = None
    status: Optional[List[str]] = None
    page: int = 1
    page_size: int = 20