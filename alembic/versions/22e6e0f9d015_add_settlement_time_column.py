"""Add settlement_time column

Revision ID: 22e6e0f9d015
Revises: 8c2ac534ee1f
Create Date: 2025-08-11 16:47:13.948096

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '22e6e0f9d015'
down_revision: Union[str, Sequence[str], None] = '8c2ac534ee1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Step 1: 添加 settlement_time 字段，允许 NULL
    op.add_column('contract', sa.Column('settlement_time', sa.DateTime(timezone=True), nullable=True))

    # Step 2: 对 status 为 '已结束' 的记录，设置 settlement_time = updated_at
    op.execute("""
        UPDATE contract 
        SET settlement_time = updated_at 
        WHERE status = '已结算'
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # 回滚时删除字段
    op.drop_column('contract', 'settlement_time')
