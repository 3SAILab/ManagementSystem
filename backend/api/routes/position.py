from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.utils.response import api_response
from ...db.session import get_async_db

router = APIRouter()

#增加职位

#删除职位