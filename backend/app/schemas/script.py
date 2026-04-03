"""脚本 API Schema"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.script import ScriptStatus, ScriptType


class ScriptGenerateRequest(BaseModel):
    """生成脚本请求"""
    topic: str = Field(..., min_length=1, max_length=500, description="主题/选题")
    script_type: ScriptType = Field(default=ScriptType.PRODUCT_SHOWCASE, description="视频类型")
    quantity: int = Field(default=1, ge=1, le=10, description="生成数量")
    style: Optional[str] = Field(default=None, description="风格要求")


class ScriptResponse(BaseModel):
    """脚本响应"""
    id: str
    title: str
    topic: str
    script_type: ScriptType
    hook: str
    body: str
    cta: str
    duration: int
    status: ScriptStatus
    created_at: datetime

    class Config:
        from_attributes = True


class ScriptListResponse(BaseModel):
    """脚本列表响应"""
    items: List[ScriptResponse]
    total: int
    page: int
    page_size: int
