from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

# ========== 学科 ==========

class SubjectBase(BaseModel):
    name: str
    alias: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class SubjectResponse(SubjectBase):
    id: int
    sort_order: int
    
    class Config:
        from_attributes = True

# ========== 章节 ==========

class ChapterBase(BaseModel):
    name: str

class ChapterResponse(ChapterBase):
    id: int
    subject_id: int
    sort_order: int
    is_exam_focus: bool
    
    class Config:
        from_attributes = True

# ========== 题目 ==========

class QuestionBase(BaseModel):
    title: str
    options: Optional[Dict[str, str]] = None
    difficulty: int = 2
    question_type: str = "choice"
    source: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int
    subject_id: int
    correct_answer: str
    analysis: Optional[str] = None
    teacher_comment: Optional[str] = None
    comment_author: Optional[str] = None
    source_year: Optional[str] = None
    wrong_reason_tags: Optional[List[str]] = None
    chapter_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuestionListItem(BaseModel):
    """题库列表页的题目摘要"""
    id: int
    title: str
    difficulty: int
    source: Optional[str]
    source_year: Optional[str]
    is_favorited: bool = False
    is_wrong: bool = False
    
    class Config:
        from_attributes = True

class QuestionFilter(BaseModel):
    subject_id: Optional[int] = None
    chapter_id: Optional[int] = None
    grade: Optional[str] = None
    difficulty: Optional[int] = None
    source: Optional[str] = None
    question_type: Optional[str] = None

# ========== 答题记录 ==========

class AnswerSubmit(BaseModel):
    question_id: int
    user_answer: str
    time_spent: int = 0  # 秒

class AnswerResponse(BaseModel):
    id: int
    question_id: int
    user_answer: str
    is_correct: bool
    is_favorited: bool
    time_spent: int
    answered_at: datetime
    
    class Config:
        from_attributes = True

# ========== 错题本 ==========

class WrongQuestionResponse(BaseModel):
    id: int
    question_id: int
    user_answer: str
    wrong_reason: Optional[str]
    wrong_reason_custom: Optional[str]
    analysis_note: Optional[str]
    status: str  # unmastered/learning/mastered
    review_count: int
    last_reviewed_at: Optional[datetime]
    mastered_at: Optional[datetime]
    created_at: datetime
    
    # 包含题目详情
    question: QuestionResponse
    
    class Config:
        from_attributes = True

class WrongReasonUpdate(BaseModel):
    wrong_reason: str
    wrong_reason_custom: Optional[str] = None

class WrongQuestionStatusUpdate(BaseModel):
    status: str  # unmastered/learning/mastered
