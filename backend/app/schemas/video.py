"""视频 API Schema"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.video import VideoStatus


class VideoCreateRequest(BaseModel):
    """创建视频任务"""
    script_id: int
    template_id: Optional[int] = None
    material_ids: List[int] = Field(default_factory=list)


class VideoRenderRequest(BaseModel):
    """渲染请求"""
    video_id: int


class VideoResponse(BaseModel):
    """视频响应"""
    id: int
    title: str
    output_path: str
    thumbnail_path: str
    duration: int
    status: VideoStatus
    progress: int
    created_at: datetime

    class Config:
        from_attributes = True


class VideoListResponse(BaseModel):
    """视频列表响应"""
    items: List[VideoResponse]
    total: int
    page: int
    page_size: int
