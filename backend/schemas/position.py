from pydantic import BaseModel
from backend.schemas.department import DepartmentOut
from typing import List

class PositionInfo(BaseModel):
    id: int
    name: str
    department_id: int

class PositionCreate(BaseModel):
    name: str
    department_id: int


class PositionOut(BaseModel):
    positions: List[PositionInfo]
    departments: List[DepartmentOut]

