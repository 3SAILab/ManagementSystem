"""Conditionally fix employee score precision

Revision ID: 31cd9a80c109
Revises: acae325b474b
Create Date: 2025-08-06 14:44:01.459310

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '31cd9a80c109'
down_revision: Union[str, Sequence[str], None] = 'acae325b474b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


COLUMNS = ['work_performance_score', 'attendance_performance_score']

def _is_numeric_5_2(col: str) -> bool:
    conn = op.get_bind()
    res = conn.execute(sa.text("""
        SELECT numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_name = 'employee' AND column_name = :col
    """), {"col": col}).fetchone()
    return res == (5, 2)

def _max_value(col: str):
    return op.get_bind().execute(
        sa.text(f"SELECT MAX({col}) FROM employee")
    ).scalar()

def upgrade():
    for col in COLUMNS:
        if _is_numeric_5_2(col):
            op.alter_column('employee', col, type_=sa.Numeric(10, 2))

def downgrade():
    for col in COLUMNS:
        max_val = _max_value(col)
        if max_val and max_val > 999.99:
            raise RuntimeError(
                f"{col} 最大值 {max_val} 超出 NUMERIC(5,2)，降级失败"
            )
        op.alter_column('employee', col, type_=sa.Numeric(5, 2))