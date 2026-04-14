from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_informal = Column(String(100), nullable=True)  # 口语化称号: "这题都能错？加油"
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    
    category = Column(String(50), nullable=True)  # streak/challenge/master/time
    requirement = Column(JSON, nullable=True)  # {"type": "streak_days", "value": 7}
    reward_points = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    
    user_achievements = relationship("UserAchievement", back_populates="achievement")

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="achievements")
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    progress = Column(Integer, default=0)  # 当前进度
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AbilityDimension(Base):
    __tablename__ = "ability_dimensions"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(50), nullable=False)  # 知识提取力/逻辑分析力/...
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    
    weight = Column(Float, default=1.0)  # 权重
    sort_order = Column(Integer, default=0)
    
    ability_records = relationship("AbilityRecord", back_populates="dimension")

class AbilityRecord(Base):
    __tablename__ = "ability_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dimension_id = Column(Integer, ForeignKey("ability_dimensions.id"))
    dimension = relationship("AbilityDimension", back_populates="ability_records")
    
    score = Column(Float, default=0.0)  # 0-100
    percentile = Column(Float, default=0.0)  # 百分位
    comment = Column(Text, nullable=True)  # 口语化点评
    suggestion = Column(Text, nullable=True)  # 提升建议
    
    test_questions_count = Column(Integer, default=0)  # 本次诊断题目数
    test_time_minutes = Column(Integer, default=0)  # 本次诊断耗时
    
    diagnosed_at = Column(DateTime(timezone=True), server_default=func.now())
