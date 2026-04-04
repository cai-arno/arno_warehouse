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


class Platform(str, Enum):
    DOUYIN = "douyin"     # 抖音
    KUAISHOU = "kuaishou" # 快手
    BILIBILI = "bilibili" # B站
    XIGUA = "xigua"       # 西瓜


class ScriptType(str, Enum):
    PRODUCT_SHOWCASE = "product_showcase"  # 产品展示
    TUTORIAL = "tutorial"                    # 教程讲解
    STORY = "story"                          # 故事叙述
    REVIEW = "review"                        # 测评种草
    LIFESTYLE = "lifestyle"                  # 生活场景


class Script(SQLModel, table=True):
    """脚本表"""
    __tablename__ = "scripts"

    id: str = Field(default=None, primary_key=True, max_length=12)  # 如 SCR_00000001
    user_id: str = Field(default=None, foreign_key="users.id", index=True)  # 归属用户
    title: str = Field(max_length=200)                       # 标题
    topic: str = Field(max_length=500)                       # 主题/选题
    script_type: ScriptType = Field(default=ScriptType.PRODUCT_SHOWCASE)
    platform: Platform = Field(default=Platform.DOUYIN)          # 目标平台
    hook: str = Field(default="")                            # 黄金3秒开场
    body: str = Field(default="")                            # 正文内容
    cta: str = Field(default="")                             # 行动号召
    duration: int = Field(default=0)                        # 预估时长(秒)
    content: str = Field(default="")                      # 完整脚本内容
    error_message: str = Field(default="")                 # 错误信息
    status: ScriptStatus = Field(default=ScriptStatus.DRAFT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)