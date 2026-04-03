"""认证 API"""
import re
import random
import json
from datetime import timedelta
from fastapi import APIRouter, HTTPException, Query

from app.core.database import async_session
from app.core.config import settings
import redis

router = APIRouter()

# Redis 连接
_redis_client = None

# 内存回退（Redis 不可用时）
_sms_codes: dict[str, str] = {}

def get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client


def _sms_key(phone: str) -> str:
    return f"sms:code:{phone}"


# ============ 发送短信验证码 ============
@router.post("/auth/send-code")
async def send_sms_code(phone: str = Query(..., description="手机号")):
    """发送短信验证码"""
    if not re.match(r"^1[3-9]\d{9}$", phone):
        raise HTTPException(status_code=400, detail="手机号格式不正确")

    demo_code = "123456"

    r = get_redis()
    if r:
        # Redis 存储，5分钟有效期
        r.setex(_sms_key(phone), 300, demo_code)
    else:
        # 回退到内存（演示用）
        import app.api.auth as auth_module
        auth_module._sms_codes[phone] = demo_code

    print(f"[SMS] 发送给 {phone} 的验证码: {demo_code}")

    return {
        "success": True,
        "message": "验证码已发送",
        "code": demo_code if settings.ENVIRONMENT == "development" else None,
    }


# ============ 验证码登录 ============
@router.post("/auth/login")
async def login(phone: str = Query(...), code: str = Query(...)):
    """手机号 + 验证码登录"""
    if not re.match(r"^1[3-9]\d{9}$", phone):
        raise HTTPException(status_code=400, detail="手机号格式不正确")

    r = get_redis()
    if r:
        stored_code = r.get(_sms_key(phone))
        if stored_code:
            r.delete(_sms_key(phone))
    else:
        import app.api.auth as auth_module
        stored_code = auth_module._sms_codes.pop(phone, None)

    if not stored_code or stored_code != code:
        raise HTTPException(status_code=401, detail="验证码错误或已过期")

    from sqlmodel import select
    from app.models.user import User

    async with async_session() as session:
        result = await session.execute(select(User).where(User.phone == phone))
        user = result.scalar_one_or_none()

        if not user:
            user = User(phone=phone, nickname=f"用户{phone[-4:]}")
            session.add(user)
            await session.commit()
            await session.refresh(user)

        from app.core.security import create_access_token
        token = create_access_token({"sub": str(user.id), "phone": phone})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "phone": user.phone,
                "nickname": user.nickname,
            },
        }


# ============ 获取当前用户信息 ============
@router.get("/auth/me")
async def get_current_user(user_id: int = Query(...)):
    """获取当前登录用户信息"""
    from sqlmodel import select
    from app.models.user import User

    async with async_session() as session:
        user = await session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")

        return {
            "id": user.id,
            "phone": user.phone,
            "nickname": user.nickname,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
