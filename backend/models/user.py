from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum

class UserType(str, enum.Enum):
    STUDENT = "student"
    PARENT = "parent"

class MemberLevel(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"
    ENTERPRISE = "enterprise"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user_type = Column(SQLEnum(UserType), default=UserType.STUDENT)
    nickname = Column(String(50), default="同学")
    avatar = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 会员信息
    member_level = Column(SQLEnum(MemberLevel), default=MemberLevel.FREE)
    member_expire_at = Column(DateTime(timezone=True), nullable=True)
    
    # 学生档案
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    
    # 家长档案
    parent_profile = relationship("ParentProfile", back_populates="user", uselist=False)
    
    # 家长绑定（作为学生时）
    parent_bindings = relationship("ParentBinding", foreign_keys="ParentBinding.student_user_id", back_populates="student_user")
    
    # 学习数据
    achievements = relationship("UserAchievement", back_populates="user")
    wrong_questions = relationship("WrongQuestion", back_populates="user")
    answer_records = relationship("AnswerRecord", back_populates="user")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    user = relationship("User", back_populates="student_profile")
    
    # 基本信息
    school = Column(String(100), nullable=True)
    grade = Column(String(20), nullable=True)  # 初一/初二/初三/高一/高二/高三
    subjects = Column(String(200), nullable=True)  # JSON数组: ["语文","数学","英语"]
    
    # 学习数据
    total_study_minutes = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_rate = Column(Float, default=0.0)
    streak_days = Column(Integer, default=0)  # 连续打卡天数
    last_study_at = Column(DateTime(timezone=True), nullable=True)
    
    # 护眼设置
    eye_care_enabled = Column(Boolean, default=True)
    eye_care_minutes = Column(Integer, default=45)  # 提醒间隔分钟

class ParentProfile(Base):
    __tablename__ = "parent_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    user = relationship("User", back_populates="parent_profile")
    
    children_count = Column(Integer, default=0)
    
    # 通知设置
    notify_wrong_question = Column(Boolean, default=True)  # 错题激增
    notify_study_time = Column(Boolean, default=True)      # 学习时长超标
    notify_achievement = Column(Boolean, default=False)  # 成就要闻
    notify_daily_report = Column(Boolean, default=False)  # 每日报告

class ParentBinding(Base):
    __tablename__ = "parent_bindings"
    
    id = Column(Integer, primary_key=True, index=True)
    student_user_id = Column(Integer, ForeignKey("users.id"))
    parent_user_id = Column(Integer, ForeignKey("users.id"))
    student_user = relationship("User", back_populates="parent_bindings", foreign_keys=[student_user_id])
    parent_user = relationship("User", foreign_keys=[parent_user_id])
    binding_code = Column(String(20), unique=True)
    status = Column(String(20), default="active")  # active/cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
