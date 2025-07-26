from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class EmailRequest(BaseModel):
    email: EmailStr
    purpose: Optional[str] = "general"  # 验证码用途

class EmailCodeRequest(BaseModel):
    email: EmailStr
    code: str
    purpose: Optional[str] = "general"

class EmailResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class VerificationResult(BaseModel):
    success: bool
    message: str
    verified: bool = False
    expires_at: Optional[datetime] = None

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str