from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.contract import Contract
from backend.schemas.contract import ContractCreate
from fastapi import HTTPException
from datetime import datetime, timezone

from backend.utils.response import api_response

class ContractService:

    # 添加合同
    @staticmethod
    async def add_contract(db: AsyncSession, contract: ContractCreate, sales_id: int):
        try:
            contract = Contract(
                client_id=contract.client_id,
                sales_id=sales_id,
                contract_type=contract.contract_type,
                total_amount=contract.total_amount,
                paid_amount=contract.paid_amount,
                commission_rate=contract.commission_rate,
                detail_pages=contract.detail_pages,
                video_count=contract.video_count,
                image_count=contract.image_count,
                workflow_count=contract.workflow_count,
                notes=contract.notes,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(contract)
            await db.commit()
            return api_response(success=True, data={"msg": "合同添加成功"})
        except Exception as e:
            await db.rollback()
            print(e)
            raise HTTPException(status_code=500, detail=str(e))
