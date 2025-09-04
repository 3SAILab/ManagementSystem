from fastapi import File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.file_resource import FileResource
from backend.config import settings
import os
from datetime import datetime

FILE_UPLOAD_DIR = settings.FILE_UPLOAD_DIR

class FileUploadService:
    # 单文件上传
    @staticmethod
    async def upload_file(db: AsyncSession, file: UploadFile = File(...), client_name: str = None, uploaded_user_id: int = None):
        # 获取原始文件名
        file_name = file.filename
        # 获取文件后缀
        file_suffix = file_name.split(".")[-1]
        # 读取文件内容并计算大小
        file_bytes = await file.read()
        file_size = len(file_bytes)
        # 生成存储文件名
        safe_client_name = (client_name or "unknown").strip().replace(" ", "_")
        stored_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{safe_client_name}.{file_suffix}"
        # 上传文件
        file_resource = FileResource(
            original_filename=file_name,
            file_type=(getattr(file, "content_type", None) or file_suffix),
            file_size=file_size,
            is_deleted=False,
            uploaded_user_id=uploaded_user_id,
            stored_filename=stored_filename,
            storage_path=FILE_UPLOAD_DIR,
        )
        # 将文件保存到本地
        os.makedirs(FILE_UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(FILE_UPLOAD_DIR, stored_filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        db.add(file_resource)
        await db.flush()
        await db.refresh(file_resource)
        return file_resource
    