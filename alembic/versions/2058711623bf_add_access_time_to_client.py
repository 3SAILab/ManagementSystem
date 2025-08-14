"""add access_time to client

Revision ID: 2058711623bf
Revises: 22e6e0f9d015
Create Date: 2025-08-13 17:28:17.926378

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2058711623bf'
down_revision: Union[str, Sequence[str], None] = '22e6e0f9d015'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 添加字段（暂时允许为空）
    op.add_column(
        "client",
        sa.Column("access_time", sa.DateTime(timezone=True), nullable=True),
    )

    # 批量设置 access_time = created_at
    op.execute("UPDATE client SET access_time = created_at WHERE access_time IS NULL;")

    # 修改为非空
    op.alter_column("client", "access_time", nullable=False)


def downgrade():
    # 删除字段
    op.drop_column("client", "access_time")