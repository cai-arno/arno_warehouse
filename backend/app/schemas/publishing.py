"""发布 API Schema"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.publishing import Platform, PublishStatus


class PublishRequest(BaseModel):
    """发布请求"""
    video_id: int
    platform: Platform
    scheduled_at: Optional[datetime] = Field(default=None, description="定时发布时间")


class PublishResponse(BaseModel):
    """发布响应"""
    id: int
    video_id: int
    platform: Platform
    status: PublishStatus
    platform_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PublishListResponse(BaseModel):
    """发布列表响应"""
    items: List[PublishResponse]
    total: int
