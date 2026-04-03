"""认证 API"""
from datetime import datetime, timedelta
import re
import random
import httpx
from fastapi import APIRouter, HTTPException, Query

from app.core.database import async_session
from app.core.config import settings

router = APIRouter()

# 模拟短信验证码存储（生产用 Redis）
_sms_codes: dict[str, str] = {}


# ============ 发送短信验证码 ============
@router.post("/auth/send-code")
async def send_sms_code(phone: str = Query(..., description="手机号")):
    """发送短信验证码"""
    # 验证手机号格式
    if not re.match(r"^1[3-9]\d{9}$", phone):
        raise HTTPException(status_code=400, detail="手机号格式不正确")

    # 演示阶段：固定验证码 123456
    demo_code = "123456"

    # 存储验证码
    _sms_codes[phone] = demo_code

    print(f"[SMS] 发送给 {phone} 的验证码: {demo_code}")

    return {
        "success": True,
        "message": "验证码已发送",
        # 演示阶段返回验证码，方便测试
        "code": demo_code if settings.ENVIRONMENT == "development" else None,
    }


# ============ 验证码登录 ============
@router.post("/auth/login")
async def login(phone: str = Query(...), code: str = Query(...)):
    """手机号 + 验证码登录"""
    # 验证手机号格式
    if not re.match(r"^1[3-9]\d{9}$", phone):
        raise HTTPException(status_code=400, detail="手机号格式不正确")

    # 验证验证码
    stored_code = _sms_codes.get(phone)
    if not stored_code or stored_code != code:
        raise HTTPException(status_code=401, detail="验证码错误或已过期")

    # 删除已使用的验证码
    del _sms_codes[phone]

    # 查询或创建用户
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

        # 生成 JWT token
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
