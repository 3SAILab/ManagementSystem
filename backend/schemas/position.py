from typing import Optional
from pydantic import BaseModel


class PositionInfo(BaseModel):
    id: int
    name: str
    department_id: int
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

class PositionCreate(BaseModel):
    name: str
    department_id: int



