"""数据看板 API"""
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from app.core.database import get_session
from app.models.script import Script, ScriptStatus
from app.models.video import Video, VideoStatus
from app.models.publishing import PublishRecord, PublishStatus

router = APIRouter()


@router.get("")
async def get_analytics_index():
    """导航页 analytics 入口（返回空数据，仅表示页面可用）"""
    return {"message": "analytics index"}


@router.get("/overview")
async def get_overview(session: AsyncSession = Depends(get_session)):
    """获取数据概览"""
    # 脚本统计
    total_scripts = await session.scalar(select(func.count(Script.id)))
    completed_scripts = await session.scalar(
        select(func.count(Script.id)).where(Script.status == ScriptStatus.COMPLETED)
    )

    # 视频统计
    total_videos = await session.scalar(select(func.count(Video.id)))
    completed_videos = await session.scalar(
        select(func.count(Video.id)).where(Video.status == VideoStatus.COMPLETED)
    )

    # 发布统计
    total_publish = await session.scalar(select(func.count(PublishRecord.id)))
    published_count = await session.scalar(
        select(func.count(PublishRecord.id)).where(PublishRecord.status == PublishStatus.PUBLISHED)
    )

    return {
        "scripts": {"total": total_scripts or 0, "completed": completed_scripts or 0},
        "videos": {"total": total_videos or 0, "completed": completed_videos or 0},
        "publishing": {"total": total_publish or 0, "published": published_count or 0},
    }


@router.get("/trends")
async def get_trends(
    days: int = Query(7, ge=1, le=90),
    session: AsyncSession = Depends(get_session),
):
    """获取趋势数据（最近 N 天）"""
    since = datetime.utcnow() - timedelta(days=days)

    # 每日脚本生成量
    scripts_by_day = await session.execute(
        select(
            func.date(Script.created_at).label("date"),
            func.count(Script.id).label("count"),
        )
        .where(Script.created_at >= since)
        .group_by(func.date(Script.created_at))
        .order_by(func.date(Script.created_at))
    )

    # 每日视频产出量
    videos_by_day = await session.execute(
        select(
            func.date(Video.created_at).label("date"),
            func.count(Video.id).label("count"),
        )
        .where(Video.created_at >= since)
        .group_by(func.date(Video.created_at))
        .order_by(func.date(Video.created_at))
    )

    # 每日发布量
    publishes_by_day = await session.execute(
        select(
            func.date(PublishRecord.created_at).label("date"),
            func.count(PublishRecord.id).label("count"),
        )
        .where(PublishRecord.created_at >= since)
        .group_by(func.date(PublishRecord.created_at))
        .order_by(func.date(PublishRecord.created_at))
    )

    return {
        "scripts": [{"date": str(r.date), "count": r.count} for r in scripts_by_day],
        "videos": [{"date": str(r.date), "count": r.count} for r in videos_by_day],
        "publishes": [{"date": str(r.date), "count": r.count} for r in publishes_by_day],
    }


@router.get("/platforms")
async def get_platform_stats(session: AsyncSession = Depends(get_session)):
    """获取各平台发布统计"""
    from app.models.publishing import Platform

    platforms = []
    for platform in Platform:
        total = await session.scalar(
            select(func.count(PublishRecord.id)).where(PublishRecord.platform == platform)
        )
        published = await session.scalar(
            select(func.count(PublishRecord.id))
            .where(PublishRecord.platform == platform)
            .where(PublishRecord.status == PublishStatus.PUBLISHED)
        )
        platforms.append({
            "platform": platform.value,
            "total": total or 0,
            "published": published or 0,
        })

    return {"platforms": platforms}


@router.get("/top")
async def get_top_videos(
    limit: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
):
    """获取播放量最高的视频（演示数据）"""
    # 演示模式：返回模拟数据
    return {
        "items": [
            {"id": i, "title": f"热门视频 #{i}", "views": 10000 * (10 - i), "likes": 1000 * (10 - i)}
            for i in range(1, limit + 1)
        ]
    }
