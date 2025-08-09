"""add client_status_enum

Revision ID: 2edb2ec412b7
Revises: e121f74241ba
Create Date: 2025-07-28 16:12:53.038981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2edb2ec412b7'
down_revision: Union[str, Sequence[str], None] = 'e121f74241ba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. 如果类型不存在就创建
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'client_log_status_enum'
            ) THEN
                CREATE TYPE client_log_status_enum AS ENUM (
                    '刚开始跟进',
                    '跟进中',
                    '已成交',
                    '客户流失',
                    '试单中',
                    '复购',
                    '更换负责人'
                );
            END IF;
        END
        $$;
    """)


def downgrade():
    # PostgreSQL 不能删除枚举值，只能 DROP TYPE，这里留空或写逻辑
    pass