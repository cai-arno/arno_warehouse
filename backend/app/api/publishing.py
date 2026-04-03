"""发布管理 API"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from app.core.database import get_session
from app.core.id_generator import generate_id
from app.models.publishing import PublishRecord, Platform, PublishStatus
from app.models.video import Video
from app.schemas.publishing import (
    PublishRequest,
    PublishResponse,
    PublishListResponse,
)
from app.services.publisher import publish_task
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("", response_model=PublishResponse)
async def create_publish(
    req: PublishRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """创建发布任务"""
    # 验证视频归属
    video = await session.get(Video, req.video_id)
    if not video or video.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Video not found")

    record = PublishRecord(
        id=generate_id("publish_records"),
        video_id=req.video_id,
        platform=req.platform,
        status=PublishStatus.PENDING,
        scheduled_at=req.scheduled_at,
    )
    session.add(record)
    await session.commit()
    await session.refresh(record)

    if not req.scheduled_at:
        record.status = PublishStatus.PUBLISHING
        await session.commit()
        background_tasks.add_task(publish_task, record.id)

    return record


@router.get("", response_model=PublishListResponse)
async def list_publish_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    platform: Optional[Platform] = None,
    status: Optional[PublishStatus] = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """获取当前用户的发布记录列表"""
    # 通过 video 表 join 实现用户隔离
    query = (
        select(PublishRecord)
        .join(Video, PublishRecord.video_id == Video.id)
        .where(Video.user_id == current_user.id)
    )
    count_query = (
        select(func.count(PublishRecord.id))
        .join(Video, PublishRecord.video_id == Video.id)
        .where(Video.user_id == current_user.id)
    )

    if platform:
        query = query.where(PublishRecord.platform == platform)
        count_query = count_query.where(PublishRecord.platform == platform)
    if status:
        query = query.where(PublishRecord.status == status)
        count_query = count_query.where(PublishRecord.status == status)

    total = await session.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size).order_by(PublishRecord.created_at.desc())
    result = await session.execute(query)
    items = result.scalars().all()

    return PublishListResponse(
        items=[PublishResponse.model_validate(r) for r in items],
        total=total,
    )


@router.get("/{record_id}", response_model=PublishResponse)
async def get_publish_record(
    record_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """获取发布记录（仅属于当前用户）"""
    record = await session.get(PublishRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # 验证归属
    video = await session.get(Video, record.video_id)
    if not video or video.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Record not found")

    return record
