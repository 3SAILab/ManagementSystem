from typing import List, Optional
import enum
from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from backend.models.client import Client
import re

class ClientStatus(enum.Enum):
    刚开始跟进 = "刚开始跟进"
    跟进中 = "跟进中"
    已成交 = "已成交"
    客户流失 = "客户流失"
    试单中 = "试单中"
    复购 = "复购"

class ClientSource(enum.Enum):
    线上 = "线上"
    线下 = "线下"
    活动 = "活动"

class ClientScale(enum.Enum):
    小 = "小"
    中 = "中"
    大 = "大"

class ClientFilter(BaseModel):
    name: Optional[str] = None
    status: Optional[List[ClientStatus]] = None
    source: Optional[List[ClientSource]] = None
    sales_name:Optional[str] = None
    page: int = 1
    page_size: int = 10
    startTime: Optional[str] = None
    endTime: Optional[str] = None


class ClientCreate(BaseModel):
    id: Optional[int] = None
    name: str
    contact_name: str
    contact_phone: str
    address: Optional[dict] = None
    online_source: Optional[str] = None
    activity_name: Optional[str] = None
    source: ClientSource
    product_type_ids: List[int] = Field(default_factory=list)
    scale: ClientScale
    status: ClientStatus = ClientStatus.刚开始跟进
    access_time: datetime

    @field_validator('access_time', mode='before')
    @classmethod
    def validate_access_time(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    return datetime.fromisoformat(v)
                except ValueError:
                    raise ValueError('Invalid datetime format')
        return v

class ClientOut(BaseModel):
    id: int = Field(...)
    name: str
    source: Optional[ClientSource] = None
    status: ClientStatus
    product_type_ids: List[int] = Field(default_factory=list)
    scale: ClientScale
    created_at: datetime
    sales_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class PaginatedClient(BaseModel):
    clients: List[ClientOut]
    total: int
    page: int
    page_size: int
    total_pages: int
    model_config = ConfigDict(from_attributes=True)
