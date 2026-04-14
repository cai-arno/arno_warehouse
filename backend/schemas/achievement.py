from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ========== 成就 ==========

class AchievementBase(BaseModel):
    code: str
    name: str
    name_informal: Optional[str] = None
    description: Optional[str] = None

class AchievementResponse(AchievementBase):
    id: int
    icon: Optional[str]
    category: Optional[str]
    requirement: Optional[dict]
    reward_points: int
    is_active: bool
    
    class Config:
        from_attributes = True

class UserAchievementResponse(BaseModel):
    id: int
    achievement_id: int
    progress: int
    is_completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    
    achievement: AchievementResponse
    
    class Config:
        from_attributes = True

class AchievementSummary(BaseModel):
    """成就页汇总"""
    total_achievements: int
    completed_achievements: int
    total_points: int
    in_progress: List[UserAchievementResponse]
    completed: List[UserAchievementResponse]
    locked: List[AchievementResponse]  # 未解锁的

# ========== 能力诊断 ==========

class AbilityDimensionBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class AbilityDimensionResponse(AbilityDimensionBase):
    id: int
    icon: Optional[str]
    weight: float
    
    class Config:
        from_attributes = True

class AbilityRecordResponse(BaseModel):
    id: int
    dimension_id: int
    score: float
    percentile: float
    comment: Optional[str]
    suggestion: Optional[str]
    test_questions_count: int
    test_time_minutes: int
    diagnosed_at: datetime
    
    dimension: AbilityDimensionResponse
    
    class Config:
        from_attributes = True

class AbilityReportResponse(BaseModel):
    """能力诊断报告"""
    dimensions: List[AbilityRecordResponse]
    overall_score: float
    generated_at: datetime

# ========== 学习进度 ==========

class TodayProgress(BaseModel):
    """首页今日学习进度"""
    total_minutes_today: int
    questions_today: int
    correct_rate_today: float
    streak_days: int
    target_minutes: int  # 目标时长
    target_questions: int  # 目标题数
