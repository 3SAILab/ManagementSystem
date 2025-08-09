"""Change db sub_task estimated_completion_time

Revision ID: adb58ed5095e
Revises: cc3114500fcf
Create Date: 2025-07-28 14:02:17.603901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'adb58ed5095e'
down_revision: Union[str, Sequence[str], None] = 'cc3114500fcf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 为所有 estimated_completion_time 为 NULL 的记录设置默认值 2
    op.execute('UPDATE "sub_task" SET "estimated_completion_time" = 2 '
           'WHERE "estimated_completion_time" IS NULL')


def downgrade() -> None:
    # 如果需要回滚，可以将值重置为 NULL
    op.execute("UPDATE sub_task SET estimated_completion_time = NULL WHERE estimated_completion_time = 2") 
    # ### end Alembic commands ###
