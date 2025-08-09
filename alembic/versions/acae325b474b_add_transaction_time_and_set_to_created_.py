"""add transaction_time and set to created_at for existing rows

Revision ID: acae325b474b
Revises: 3b3919600119
Create Date: 2025-08-04 16:42:27.099676

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'acae325b474b'
down_revision: Union[str, Sequence[str], None] = '3b3919600119'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Step 1: 添加字段，允许为空（暂时）
    op.add_column('contract', sa.Column('transaction_time', sa.DateTime(timezone=True), nullable=True))

    # Step 2: 将每条记录的 created_at 值复制给 transaction_time
    op.execute("UPDATE contract SET transaction_time = created_at WHERE transaction_time IS NULL")

    # Step 3: 修改字段为非空
    op.alter_column('contract', 'transaction_time', nullable=False)

def downgrade():
    # 回退：删除字段
    op.drop_column('contract', 'transaction_time')