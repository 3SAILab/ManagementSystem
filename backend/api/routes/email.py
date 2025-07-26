from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from backend.schemas.email import EmailRequest, EmailCodeRequest, EmailResponse, VerificationResult, ResetPasswordRequest
from backend.services.email_service import EmailVerificationService
import logging
from backend.db.session import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.services.employee_service import EmployeeService

logger = logging.getLogger(__name__)

router = APIRouter()
email_service = EmailVerificationService()

@router.post("/email/send-code", response_model=EmailResponse, summary="发送验证码")
async def send_verification_code(request: EmailRequest, background_tasks: BackgroundTasks):
    """
    发送邮箱验证码
    
    - **email**: 接收验证码的邮箱地址
    - **purpose**: 验证码用途 (register, login, reset_password, general)
    """
    logger.info(f"发送验证码请求: {request.email}, 用途: {request.purpose}")
    result = email_service.send_verification_code(request.email, background_tasks, request.purpose)
    if result["success"]:
        logger.info(f"验证码发送成功: {request.email}")
    else:
        logger.warning(f"验证码发送失败: {request.email}, 原因: {result['message']}")
    return EmailResponse(**result)

@router.post("/email/verify-code", response_model=VerificationResult, summary="验证验证码")
async def verify_email_code(request: EmailCodeRequest):
    """
    验证邮箱验证码
    
    - **email**: 邮箱地址
    - **code**: 验证码
    - **purpose**: 验证码用途
    """
    logger.info(f"验证验证码请求: {request.email}, 用途: {request.purpose}")
    result = email_service.verify_code(request.email, request.code, request.purpose)
    logger.info(f"验证码验证结果: {request.email}, 结果: {result['verified']}")
    return VerificationResult(**result)

@router.get("/email/code-info/{email}", response_model=EmailResponse, summary="获取验证码信息")
async def get_code_info(email: str, purpose: str = "general"):
    """
    获取验证码信息（用于调试）
    """
    result = email_service.get_code_info(email, purpose)
    return EmailResponse(
        success=result["exists"],
        message=result["message"],
        data=result
    )

@router.get("/health", summary="健康检查")
async def health_check():
    """健康检查接口"""
    return {"status": "healthy", "service": "email-verification-service"}

@router.post("/email/reset-password", response_model=EmailResponse, summary="重置密码")
async def reset_password(
    request: ResetPasswordRequest,
    db:AsyncSession = Depends(get_async_db)
):
    """
    重置密码
    验证验证码
    """ 
    # 验证验证码
    result =  email_service.verify_code(request.email, request.code, "reset_password")
    print("重置密码结果", result)
    if result['verified']:
        #重置密码
        result = await EmployeeService.reset_password(db, request.email, request.new_password)
    else:
        return result
    if result["success"]:
        #重置成功
        return result
    else:
        return result