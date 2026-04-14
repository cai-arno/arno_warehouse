from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.user import UserType, MemberLevel

# ========== 用户相关 ==========

class UserBase(BaseModel):
    phone: str

class UserCreate(UserBase):
    password: str
    user_type: UserType = UserType.STUDENT
    nickname: Optional[str] = None

class UserLogin(BaseModel):
    phone: str
    password: str

class UserResponse(UserBase):
    id: int
    user_type: UserType
    nickname: str
    avatar: Optional[str]
    member_level: MemberLevel
    member_expire_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

# ========== 学生档案 ==========

class StudentProfileBase(BaseModel):
    school: Optional[str] = None
    grade: Optional[str] = None
    subjects: Optional[List[str]] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    total_study_minutes: int
    total_questions: int
    correct_rate: float
    streak_days: int
    last_study_at: Optional[datetime]
    eye_care_enabled: bool
    eye_care_minutes: int
    
    class Config:
        from_attributes = True

# ========== 家长档案 ==========

class ParentProfileBase(BaseModel):
    children_count: int = 0
    notify_wrong_question: bool = True
    notify_study_time: bool = True
    notify_achievement: bool = False
    notify_daily_report: bool = False

class ParentProfileUpdate(BaseModel):
    children_count: Optional[int] = None
    notify_wrong_question: Optional[bool] = None
    notify_study_time: Optional[bool] = None
    notify_achievement: Optional[bool] = None
    notify_daily_report: Optional[bool] = None

class ParentProfileResponse(ParentProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# ========== 家长绑定 ==========

class BindingCreate(BaseModel):
    student_user_id: int

class BindingResponse(BaseModel):
    id: int
    binding_code: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
