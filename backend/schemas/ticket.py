from pydantic import BaseModel


class TicketCreate(BaseModel):
    name: str
    contract_id: int
    needArt: bool
    needRender: bool
    needShoot: bool
    detail_pages: int
    video_count: int
    image_count: int
    workflow_count: int
    wechatGroup: str
    notes: str = ''
    priority: str
    platform: str