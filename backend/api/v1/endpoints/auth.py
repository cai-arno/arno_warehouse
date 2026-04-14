from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_password_hash, verify_password, create_access_token, get_current_active_user
from models.user import User, StudentProfile, UserType
from schemas.user import UserCreate, UserLogin, UserResponse, Token, StudentProfileResponse

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # 检查手机号是否已注册
    existing_user = db.query(User).filter(User.phone == user_data.phone).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该手机号已注册"
        )
    
    # 创建用户
    user = User(
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        user_type=user_data.user_type,
        nickname=user_data.nickname or "同学"
    )
    db.add(user)
    db.flush()
    
    # 创建学生或家长档案
    if user_data.user_type == UserType.STUDENT:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
    
    db.commit()
    db.refresh(user)
    
    # 生成token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == login_data.phone).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/me/profile", response_model=StudentProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != UserType.STUDENT:
        raise HTTPException(status_code=400, detail="当前用户不是学生")
    
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="学生档案不存在")
    
    return profile
