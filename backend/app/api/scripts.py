"""脚本生成 API"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from app.core.database import get_session
from app.models.script import Script, ScriptStatus, ScriptType, Platform
from app.schemas.script import (
    ScriptGenerateRequest,
    ScriptResponse,
    ScriptListResponse,
    HotTopicResponse,
    GenerateFromHotRequest,
    SuggestAnglesRequest,
    SuggestAnglesResponse,
    ScriptAngleOption,
)
from app.services.script_generator import ScriptGenerator
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/generate", response_model=ScriptResponse)
async def generate_script(
    req: ScriptGenerateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """AI 生成脚本（支持平台差异化）"""
    generator = ScriptGenerator(session)
    try:
        script = await generator.generate(
            topic=req.topic,
            script_type=req.script_type,
            quantity=req.quantity,
            style=req.style,
            platform=req.platform,
            user_id=current_user.id,
        )
        return script
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=ScriptListResponse)
async def list_scripts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ScriptStatus] = None,
    script_type: Optional[ScriptType] = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """获取当前用户的脚本列表"""
    query = select(Script).where(Script.user_id == current_user.id)
    count_query = select(func.count(Script.id)).where(Script.user_id == current_user.id)

    if status:
        query = query.where(Script.status == status)
        count_query = count_query.where(Script.status == status)
    if script_type:
        query = query.where(Script.script_type == script_type)
        count_query = count_query.where(Script.script_type == script_type)

    total = await session.scalar(count_query) or 0
    query = query.offset((page - 1) * page_size).limit(page_size).order_by(Script.created_at.desc())
    result = await session.execute(query)
    items = result.scalars().all()

    return ScriptListResponse(
        items=[ScriptResponse.model_validate(s) for s in items],
        total=total,
        page=page,
        page_size=page_size,
    )


# ─── 热点追踪脚本（需放在 /{script_id} 之前） ─────────────────────────────


@router.get("/hot-topics", response_model=list[HotTopicResponse])
async def get_hot_topics(
    category: Optional[str] = Query(None, description="按分类筛选"),
    session: AsyncSession = Depends(get_session),
):
    """获取当前热点话题列表（无需认证）"""
    generator = ScriptGenerator(session)
    topics = await generator.get_hot_topics(category=category)
    return [HotTopicResponse(**t) for t in topics]


@router.post("/generate-from-hot", response_model=ScriptResponse)
async def generate_from_hot(
    req: GenerateFromHotRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """基于热点话题生成脚本"""
    generator = ScriptGenerator(session)
    try:
        script = await generator.generate_from_hot(
            hot_topic_id=req.hot_topic_id,
            script_type=req.script_type,
            platform=req.platform,
            custom_angle=req.custom_angle,
            user_id=current_user.id,
        )
        return script
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 脚本创意增强 ─────────────────────────────────────────────


@router.post("/suggest-angles", response_model=SuggestAnglesResponse)
async def suggest_angles(
    req: SuggestAnglesRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """获取创意角度建议（用户可选中某个角度后生成完整脚本）"""
    generator = ScriptGenerator(session)
    try:
        angles_raw = await generator.suggest_angles(
            topic=req.topic,
            script_type=req.script_type,
            count=req.count,
        )
        angles = [ScriptAngleOption(**a) for a in angles_raw]
        return SuggestAnglesResponse(topic=req.topic, angles=angles)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 通用脚本操作 ─────────────────────────────────────────────


@router.get("/{script_id}", response_model=ScriptResponse)
async def get_script(
    script_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """获取单个脚本（仅属于当前用户）"""
    script = await session.get(Script, script_id)
    if not script or script.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Script not found")
    return script


@router.delete("/{script_id}")
async def delete_script(
    script_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """删除脚本（仅属于当前用户）"""
    script = await session.get(Script, script_id)
    if not script or script.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Script not found")
    await session.delete(script)
    await session.commit()
    return {"message": "deleted"}
