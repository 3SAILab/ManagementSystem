"""add owner to EmployeeRole

Revision ID: 622d43fac804
Revises: 2edb2ec412b7
Create Date: 2025-07-30 10:17:36.380452

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '622d43fac804'
down_revision: Union[str, Sequence[str], None] = '2edb2ec412b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ENUM_NAME = "EmployeeRole"  # 常见命名：{table}_{column}_enum

def upgrade():
    op.execute(f"ALTER TYPE {ENUM_NAME} ADD VALUE 'owner';")


def downgrade():
    # 无法安全删除 ENUM 值
    # 可选：记录日志或抛出异常
    pass
