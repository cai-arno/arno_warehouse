"""API 依赖"""
from fastapi import Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_session
from app.core.security import decode_token
from app.models.user import User


async def get_current_user(
    authorization: Optional[str] = Header(None),
    session: AsyncSession = Depends(get_session),
) -> User:
    """从 JWT Token 获取当前用户"""
    if not authorization:
        raise HTTPException(status_code=401, detail="未提供认证信息")

    # Bearer token 格式
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="无效的认证格式")

    token = parts[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token 无效或已过期")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token 缺少用户信息")

    user = await session.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")

    return user
