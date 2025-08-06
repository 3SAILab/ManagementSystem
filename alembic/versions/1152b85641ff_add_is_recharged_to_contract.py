"""add is_recharged to contract

Revision ID: 1152b85641ff
Revises: 31cd9a80c109
Create Date: 2025-08-06 17:59:24.750427

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1152b85641ff'
down_revision: Union[str, Sequence[str], None] = '31cd9a80c109'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'contract',
        sa.Column(
            'is_recharged',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false()
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('contract', 'is_recharged')