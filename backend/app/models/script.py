"""脚本数据模型"""
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field


class ScriptStatus(str, Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class ScriptType(str, Enum):
    PRODUCT_SHOWCASE = "product_showcase"  # 产品展示
    TUTORIAL = "tutorial"                    # 教程讲解
    STORY = "story"                          # 故事叙述
    REVIEW = "review"                        # 测评种草
    LIFESTYLE = "lifestyle"                  # 生活场景


class Script(SQLModel, table=True):
    """脚本表"""
    __tablename__ = "scripts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(default=None, foreign_key="users.id", index=True)  # 归属用户
    title: str = Field(max_length=200)                       # 标题
    topic: str = Field(max_length=500)                       # 主题/选题
    script_type: ScriptType = Field(default=ScriptType.PRODUCT_SHOWCASE)
    hook: str = Field(default="")                            # 黄金3秒开场
    body: str = Field(default="")                            # 正文内容
    cta: str = Field(default="")                             # 行动号召
    duration: int = Field(default=0)                        # 预估时长(秒)
    status: ScriptStatus = Field(default=ScriptStatus.DRAFT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)