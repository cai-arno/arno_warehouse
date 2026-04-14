from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # 语文/数学/英语/物理/化学/历史
    alias = Column(String(50), nullable=True)  # 别名/缩写
    icon = Column(String(100), nullable=True)
    color = Column(String(20), nullable=True)  # 主题色
    sort_order = Column(Integer, default=0)
    
    chapters = relationship("Chapter", back_populates="subject")
    questions = relationship("Question", back_populates="subject")

class Chapter(Base):
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    subject = relationship("Subject", back_populates="chapters")
    name = Column(String(100), nullable=False)
    sort_order = Column(Integer, default=0)
    is_exam_focus = Column(Boolean, default=False)  # 是否中考重点

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    subject = relationship("Subject", back_populates="questions")
    
    title = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer = Column(String(10), nullable=False)  # A/B/C/D
    analysis = Column(Text, nullable=True)  # 标准解析
    teacher_comment = Column(Text, nullable=True)  # 名师点评
    comment_author = Column(String(50), nullable=True)  # 点評作者: "张老师团队/省级名师"
    
    difficulty = Column(Integer, default=2)  # 1-5星
    question_type = Column(String(20), default="choice")  # choice/multiple/blank/judge
    source = Column(String(50), nullable=True)  # 中考/高考/模拟/原创
    source_year = Column(String(10), nullable=True)  # 2019浙江卷
    source_url = Column(String(500), nullable=True)
    
    wrong_reason_tags = Column(JSON, nullable=True)  # ["计算失误","审题不清","知识点遗忘","思路跑偏"]
    
    similar_questions = Column(JSON, nullable=True)  # [question_id, ...] 同类题ID列表
    
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    answer_records = relationship("AnswerRecord", back_populates="question")
    wrong_questions = relationship("WrongQuestion", back_populates="question")

class AnswerRecord(Base):
    __tablename__ = "answer_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="answer_records")
    question_id = Column(Integer, ForeignKey("questions.id"))
    question = relationship("Question", back_populates="answer_records")
    
    user_answer = Column(String(10), nullable=True)
    is_correct = Column(Boolean, default=False)
    is_favorited = Column(Boolean, default=False)
    time_spent = Column(Integer, default=0)  # 耗时秒数
    
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

class WrongQuestion(Base):
    __tablename__ = "wrong_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="wrong_questions")
    question_id = Column(Integer, ForeignKey("questions.id"))
    question = relationship("Question", back_populates="wrong_questions")
    
    user_answer = Column(String(10), nullable=False)  # 当时的错误答案
    wrong_reason = Column(String(50), nullable=True)  # 错因标签
    wrong_reason_custom = Column(Text, nullable=True)  # 自定义错因
    analysis_note = Column(Text, nullable=True)  # 学生的个人笔记
    
    status = Column(String(20), default="unmastered")  # unmastered/learning/mastered
    review_count = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    mastered_at = Column(DateTime(timezone=True), nullable=True)  # 掌握时间
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
