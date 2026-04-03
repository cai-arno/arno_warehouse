"""模板 API Schema"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.template import TemplateType


class TemplateResponse(BaseModel):
    """模板响应"""
    id: str
    name: str
    template_type: TemplateType
    thumbnail_url: str
    script_type: str
    tags: List[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateListResponse(BaseModel):
    """模板列表响应"""
    items: List[TemplateResponse]
    total: int
