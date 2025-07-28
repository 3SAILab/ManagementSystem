"""add 更换负责人 to client_status_enum

Revision ID: e121f74241ba
Revises: d03edd523ccd
Create Date: 2025-07-28 16:05:23.665173

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e121f74241ba'
down_revision: Union[str, Sequence[str], None] = 'd03edd523ccd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE client_status_enum ADD VALUE '更换负责人'")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TYPE client_status_enum DROP VALUE '更换负责人'")
