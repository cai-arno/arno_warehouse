from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from core.database import get_db
from core.security import get_current_active_user
from models.user import User, UserType
from models.question import Question, Subject, Chapter, AnswerRecord, WrongQuestion
from schemas.question import (
    QuestionResponse, QuestionListItem, QuestionFilter,
    AnswerSubmit, AnswerResponse, WrongQuestionResponse,
    WrongReasonUpdate, WrongQuestionStatusUpdate, SubjectResponse
)

router = APIRouter(prefix="/questions", tags=["题库"])

@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    """获取学科列表"""
    subjects = db.query(Subject).order_by(Subject.sort_order).all()
    return subjects

@router.get("", response_model=List[QuestionListItem])
def get_questions(
    subject_id: Optional[int] = Query(None),
    chapter_id: Optional[int] = Query(None),
    difficulty: Optional[int] = Query(None),
    source: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取题目列表（支持筛选）"""
    query = db.query(Question)
    
    if subject_id:
        query = query.filter(Question.subject_id == subject_id)
    if chapter_id:
        query = query.filter(Question.chapter_id == chapter_id)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if source:
        query = query.filter(Question.source == source)
    
    questions = query.offset(skip).limit(limit).all()
    
    # 标记收藏和错题状态
    result = []
    for q in questions:
        item = QuestionListItem(
            id=q.id,
            title=q.title,
            difficulty=q.difficulty,
            source=q.source,
            source_year=q.source_year,
            is_favorited=db.query(AnswerRecord).filter(
                AnswerRecord.user_id == current_user.id,
                AnswerRecord.question_id == q.id,
                AnswerRecord.is_favorited == True
            ).first() is not None,
            is_wrong=db.query(WrongQuestion).filter(
                WrongQuestion.user_id == current_user.id,
                WrongQuestion.question_id == q.id
            ).first() is not None
        )
        result.append(item)
    
    return result

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取题目详情"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="题目不存在")
    return question

@router.post("/answer", response_model=AnswerResponse)
def submit_answer(
    answer: AnswerSubmit,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """提交答案"""
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    is_correct = answer.user_answer.upper() == question.correct_answer.upper()
    
    # 记录答题
    record = AnswerRecord(
        user_id=current_user.id,
        question_id=answer.question_id,
        user_answer=answer.user_answer,
        is_correct=is_correct,
        time_spent=answer.time_spent
    )
    db.add(record)
    
    # 如果答错，自动加入错题本
    if not is_correct:
        existing_wrong = db.query(WrongQuestion).filter(
            WrongQuestion.user_id == current_user.id,
            WrongQuestion.question_id == answer.question_id
        ).first()
        
        if not existing_wrong:
            wrong_q = WrongQuestion(
                user_id=current_user.id,
                question_id=answer.question_id,
                user_answer=answer.user_answer,
                status="unmastered"
            )
            db.add(wrong_q)
    
    db.commit()
    db.refresh(record)
    
    return AnswerResponse(
        id=record.id,
        question_id=record.question_id,
        user_answer=record.user_answer,
        is_correct=record.is_correct,
        is_favorited=record.is_favorited,
        time_spent=record.time_spent,
        answered_at=record.answered_at
    )

@router.get("/wrong/list", response_model=List[WrongQuestionResponse])
def get_wrong_questions(
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取错题本列表"""
    query = db.query(WrongQuestion).filter(WrongQuestion.user_id == current_user.id)
    
    if status:
        query = query.filter(WrongQuestion.status == status)
    
    return query.order_by(WrongQuestion.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/wrong/{wrong_id}/reason")
def update_wrong_reason(
    wrong_id: int,
    update: WrongReasonUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新错因标签"""
    wrong_q = db.query(WrongQuestion).filter(
        WrongQuestion.id == wrong_id,
        WrongQuestion.user_id == current_user.id
    ).first()
    
    if not wrong_q:
        raise HTTPException(status_code=404, detail="错题记录不存在")
    
    wrong_q.wrong_reason = update.wrong_reason
    wrong_q.wrong_reason_custom = update.wrong_reason_custom
    db.commit()
    
    return {"message": "更新成功"}

@router.put("/wrong/{wrong_id}/status")
def update_wrong_status(
    wrong_id: int,
    update: WrongQuestionStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新错题状态"""
    wrong_q = db.query(WrongQuestion).filter(
        WrongQuestion.id == wrong_id,
        WrongQuestion.user_id == current_user.id
    ).first()
    
    if not wrong_q:
        raise HTTPException(status_code=404, detail="错题记录不存在")
    
    if update.status == "mastered":
        wrong_q.status = "mastered"
        wrong_q.mastered_at = func.now()
    else:
        wrong_q.status = update.status
    
    wrong_q.review_count += 1
    wrong_q.last_reviewed_at = func.now()
    db.commit()
    
    return {"message": "更新成功"}
