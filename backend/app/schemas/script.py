"""脚本 API Schema"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.script import ScriptStatus, ScriptType, Platform


# ─── 热点追踪 ────────────────────────────────────────────────

class HotTopicResponse(BaseModel):
    """热点话题响应"""
    id: str
    topic: str
    category: str
    heat_score: int
    source: str
    description: str


class GenerateFromHotRequest(BaseModel):
    """基于热点生成脚本请求"""
    hot_topic_id: str = Field(..., description="热点话题ID")
    script_type: ScriptType = Field(default=ScriptType.PRODUCT_SHOWCASE, description="视频类型")
    platform: Platform = Field(default=Platform.DOUYIN, description="目标平台")
    custom_angle: Optional[str] = Field(default=None, description="自定义角度描述（可选）")


# ─── 脚本创意增强 ──────────────────────────────────────────────

class ScriptAngleOption(BaseModel):
    """创意角度选项"""
    angle_id: str = Field(description="角度ID（用于选中生成）")
    angle_name: str = Field(description="角度名称，如「对比反差」「知识科普」")
    description: str = Field(description="该角度的核心卖点")
    outline: str = Field(description="脚本大纲草稿（3-5个要点）")
    recommended_platform: Platform = Field(description="推荐平台")
    estimated_duration: int = Field(description="预估时长（秒）")


class SuggestAnglesRequest(BaseModel):
    """获取创意角度建议请求"""
    topic: str = Field(..., min_length=1, max_length=500, description="主题/选题")
    script_type: ScriptType = Field(default=ScriptType.PRODUCT_SHOWCASE, description="视频类型")
    count: int = Field(default=4, ge=3, le=6, description="返回角度数量")


class SuggestAnglesResponse(BaseModel):
    """创意角度建议响应"""
    topic: str
    angles: List[ScriptAngleOption]


# ─── 平台差异化生成 ─────────────────────────────────────────────

class PlatformScriptRequest(BaseModel):
    """指定平台生成脚本请求"""
    topic: str = Field(..., min_length=1, max_length=500, description="主题/选题")
    script_type: ScriptType = Field(default=ScriptType.PRODUCT_SHOWCASE, description="视频类型")
    platform: Platform = Field(..., description="目标平台")
    quantity: int = Field(default=1, ge=1, le=10, description="生成数量")
    custom_angle: Optional[str] = Field(default=None, description="自定义角度")


class ScriptGenerateRequest(BaseModel):
    """生成脚本请求"""
    topic: str = Field(..., min_length=1, max_length=500, description="主题/选题")
    script_type: ScriptType = Field(default=ScriptType.PRODUCT_SHOWCASE, description="视频类型")
    quantity: int = Field(default=1, ge=1, le=10, description="生成数量")
    style: Optional[str] = Field(default=None, description="风格要求")
    platform: Platform = Field(default=Platform.DOUYIN, description="目标平台")


class ScriptResponse(BaseModel):
    """脚本响应"""
    id: str
    title: str
    topic: str
    script_type: ScriptType
    platform: Platform
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
