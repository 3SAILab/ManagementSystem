from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class TicketCreate(BaseModel):
    name: str
    contract_id: int
    needArt: bool
    needRender: bool
    needShoot: bool
    needWatermark: bool
    detail_pages: int
    video_count: int
    image_count: int
    workflow_count: int
    wechatGroup: str
    notes: str = ''
    priority: str
    platform: str
    product_type_id: Optional[int] = None
    product_name: Optional[str] = None
    price: Optional[Decimal] = None

class TicketUpdate(BaseModel):
    name: str
    detail_pages: int
    video_count: int
    image_count: int
    workflow_count: int
    wechat_group: str
    notes: str = ''
    priority: str
    platform: str
    product_type_id: Optional[int] = None
    product_name: Optional[str] = None
    price: Optional[Decimal] = None