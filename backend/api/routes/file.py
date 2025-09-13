from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from backend.models.file_resource import FileResource
from backend.models.contract import Contract
from backend.db.session import get_async_db
from backend.api.routes.employee import get_current_employee
from backend.models.employee import Employee
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import mimetypes
from typing import List

router = APIRouter()

@router.get("/files/{file_id}/preview")
async def preview_file(
    file_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """文件预览接口"""
    # 获取文件信息
    file_resource = await db.get(FileResource, file_id)
    if not file_resource or file_resource.is_deleted:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 构建文件路径
    file_path = os.path.join(file_resource.storage_path, file_resource.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 根据文件类型返回不同响应
    mime_type = file_resource.file_type or mimetypes.guess_type(file_path)[0]
    
    # 支持的预览类型
    if mime_type in ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']:
        return FileResponse(
            path=file_path,
            media_type=mime_type,
            filename=file_resource.original_filename,
            headers={"Content-Disposition": "inline"}  # 浏览器内预览
        )
    else:
        raise HTTPException(status_code=415, detail="不支持的文件类型")

@router.get("/files/{file_id}/download")
async def download_file(
    file_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """文件下载接口"""
    file_resource = await db.get(FileResource, file_id)
    if not file_resource or file_resource.is_deleted:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    file_path = os.path.join(file_resource.storage_path, file_resource.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(
        path=file_path,
        media_type=file_resource.file_type,
        filename=file_resource.original_filename,
        headers={"Content-Disposition": "attachment"}  # 强制下载
    )

@router.get("/contracts/{contract_id}/files")
async def get_contract_files(
    contract_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """获取合同相关的所有文件（包括附属合同的文件）"""
    # 获取主合同
    main_contract = await db.get(Contract, contract_id)
    if not main_contract:
        raise HTTPException(status_code=404, detail="合同不存在")
    
    files = []
    
    # 主合同文件
    if main_contract.file_resource_id:
        main_file = await db.get(FileResource, main_contract.file_resource_id)
        if main_file and not main_file.is_deleted:
            files.append({
                'id': main_file.id,
                'original_filename': main_file.original_filename,
                'file_type': main_file.file_type,
                'file_size': main_file.file_size,
                'contract_type': '主合同',
                'contract_id': main_contract.id,
                'upload_time': main_file.upload_time.isoformat() if main_file.upload_time else None
            })
    
    # 附属合同文件
    appendix_contracts = await db.execute(
        select(Contract).where(Contract.parent_contract_id == contract_id)
    )
    
    for appendix in appendix_contracts.scalars():
        if appendix.file_resource_id:
            appendix_file = await db.get(FileResource, appendix.file_resource_id)
            if appendix_file and not appendix_file.is_deleted:
                files.append({
                    'id': appendix_file.id,
                    'original_filename': appendix_file.original_filename,
                    'file_type': appendix_file.file_type,
                    'file_size': appendix_file.file_size,
                    'contract_type': f'附属合同-{appendix.id}',
                    'contract_id': appendix.id,
                    'upload_time': appendix_file.upload_time.isoformat() if appendix_file.upload_time else None
                })
    
    return {'files': files}

@router.get("/files/{file_id}/info")
async def get_file_info(
    file_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_employee: Employee = Depends(get_current_employee)
):
    """获取文件信息"""
    file_resource = await db.get(FileResource, file_id)
    if not file_resource or file_resource.is_deleted:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return {
        'id': file_resource.id,
        'original_filename': file_resource.original_filename,
        'file_type': file_resource.file_type,
        'file_size': file_resource.file_size,
        'upload_time': file_resource.upload_time.isoformat() if file_resource.upload_time else None,
        'uploaded_user_id': file_resource.uploaded_user_id
    }