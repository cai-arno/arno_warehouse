from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_active_user
from models.user import User
from models.achievement import Achievement, UserAchievement, AbilityDimension, AbilityRecord
from schemas.achievement import (
    AchievementResponse, UserAchievementResponse, AchievementSummary,
    AbilityDimensionResponse, AbilityRecordResponse, AbilityReportResponse
)

router = APIRouter(prefix="/achievements", tags=["成就与能力"])

@router.get("", response_model=AchievementSummary)
def get_achievement_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取成就汇总"""
    # 所有成就
    all_achievements = db.query(Achievement).filter(Achievement.is_active == True).all()
    
    # 用户已获得的成就
    user_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).all()
    
    completed_ids = {ua.achievement_id for ua in user_achievements if ua.is_completed}
    completed = [ua for ua in user_achievements if ua.is_completed]
    in_progress = [ua for ua in user_achievements if not ua.is_completed]
    locked = [a for a in all_achievements if a.id not in completed_ids]
    
    total_points = sum(ua.achievement.reward_points for ua in completed)
    
    return AchievementSummary(
        total_achievements=len(all_achievements),
        completed_achievements=len(completed),
        total_points=total_points,
        in_progress=in_progress,
        completed=completed,
        locked=locked
    )

@router.get("/dimensions", response_model=List[AbilityDimensionResponse])
def get_ability_dimensions(db: Session = Depends(get_db)):
    """获取能力维度列表"""
    return db.query(AbilityDimension).order_by(AbilityDimension.sort_order).all()

@router.get("/ability/latest", response_model=AbilityReportResponse)
def get_latest_ability_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取最近一次能力诊断报告"""
    # 获取最新的诊断记录
    latest_records = db.query(AbilityRecord).filter(
        AbilityRecord.user_id == current_user.id
    ).order_by(AbilityRecord.diagnosed_at.desc()).limit(5).all()
    
    if not latest_records:
        raise HTTPException(status_code=404, detail="暂无诊断记录")
    
    # 获取同一批次诊断的所有维度
    latest_id = latest_records[0].id
    records = db.query(AbilityRecord).filter(
        AbilityRecord.user_id == current_user.id,
        AbilityRecord.id == latest_id
    ).all()
    
    if not records:
        raise HTTPException(status_code=404, detail="暂无诊断记录")
    
    overall_score = sum(r.score * r.dimension.weight for r in records) / sum(r.dimension.weight for r in records)
    
    return AbilityReportResponse(
        dimensions=records,
        overall_score=round(overall_score, 1),
        generated_at=records[0].diagnosed_at
    )
