"""add prepayment_sales_id, final_payment_sales_id, transfer_date to contract

Revision ID: b27aee7a55f2
Revises: 2058711623bf
Create Date: 2025-08-23 13:04:39.780544

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b27aee7a55f2'
down_revision: Union[str, Sequence[str], None] = '2058711623bf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: 添加字段，允许 NULL（先加字段，再填值）
    op.add_column('contract', sa.Column('prepayment_sales_id', sa.Integer(), nullable=True))
    op.add_column('contract', sa.Column('final_payment_sales_id', sa.Integer(), nullable=True))
    op.add_column('contract', sa.Column('transfer_date', sa.DateTime(timezone=True), nullable=True))

    # Step 2: 设置外键约束（可选，也可在下一步一起加）
    op.create_foreign_key(
        'fk_contract_prepayment_sales_id_employee',
        'contract', 'employee',
        ['prepayment_sales_id'], ['id']
    )
    op.create_foreign_key(
        'fk_contract_final_payment_sales_id_employee',
        'contract', 'employee',
        ['final_payment_sales_id'], ['id']
    )

    # Step 3: 将 prepayment_sales_id 和 final_payment_sales_id 初始化为 sales_id
    op.execute("""
        UPDATE contract 
        SET prepayment_sales_id = sales_id, 
            final_payment_sales_id = sales_id
        WHERE sales_id IS NOT NULL
    """)

    # Step 4: 可选：将 transfer_date 初始化为当前时间（如果需要）
    # 如果你想让已有合同的 transfer_date 为空，就跳过这一步
    # op.execute("""
    #     UPDATE contract 
    #     SET transfer_date = NOW()
    #     WHERE sales_id IS NOT NULL
    # """)

    # Step 5: 修改字段为非空（如果你后续想改为 nullable=False）
    # 注意：只有在确保所有行都被填充后才能改
    # op.alter_column('contract', 'prepayment_sales_id', nullable=False)
    # op.alter_column('contract', 'final_payment_sales_id', nullable=False)


def downgrade() -> None:
    # 删除外键约束
    op.drop_constraint('fk_contract_final_payment_sales_id_employee', 'contract', type_='foreignkey')
    op.drop_constraint('fk_contract_prepayment_sales_id_employee', 'contract', type_='foreignkey')

    # 删除字段
    op.drop_column('contract', 'transfer_date')
    op.drop_column('contract', 'final_payment_sales_id')
    op.drop_column('contract', 'prepayment_sales_id')
    
