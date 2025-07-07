from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db.session import get_db
from ..models.user import User, UserCreate, UserOut
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # 使用参数化查询以防止SQL注入
    query = select(User).where(User.username == form_data.username)
    user = db.execute(query).scalars().first()

    if not user or user.password != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"username": user.username, "detail": "Login successful (token generation not implemented)"}


