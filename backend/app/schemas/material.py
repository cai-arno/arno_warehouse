"""素材 API Schema"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.material import MaterialType


class MaterialUploadResponse(BaseModel):
    """素材上传响应"""
    id: int
    name: str
    material_type: MaterialType
    oss_url: str
    thumbnail_url: Optional[str] = None
    file_size: int
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None


class MaterialResponse(BaseModel):
    """素材响应"""
    id: int
    name: str
    material_type: MaterialType
    oss_url: str
    thumbnail_url: Optional[str] = None
    file_size: int
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    tags: List[str]
    category: str
    created_at: datetime

    class Config:
        from_attributes = True


class MaterialListResponse(BaseModel):
    """素材列表响应"""
    items: List[MaterialResponse]
    total: int
    page: int
    page_size: int
