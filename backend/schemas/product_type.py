from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ProductTypeBase(BaseModel):
    name: str
    sort_order: int = 0
    is_active: bool = True


class ProductTypeCreate(ProductTypeBase):
    pass


class ProductTypeUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class ProductTypeOut(ProductTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True