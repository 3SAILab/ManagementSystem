"""add_contract_appendix_and_operation_log

Revision ID: f1a2b3c4d5e6
Revises: e121f74241ba
Create Date: 2025-09-13 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = '2f5e3cde36ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new columns to contract table
    op.add_column(
        'contract',
        sa.Column(
            'parent_contract_id',
            sa.Integer(),
            sa.ForeignKey('contract.id'),
            nullable=True
        )
    )
    op.add_column(
        'contract',
        sa.Column(
            'notes',
            sa.Text(),
            nullable=True
        )
    )
    op.add_column(
        'contract',
        sa.Column(
            'is_appendix',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false()
        )
    )
    
    # Create contract_operation_log table
    op.create_table(
        'contract_operation_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('contract_id', sa.Integer(), nullable=False),
        sa.Column('operator_id', sa.Integer(), nullable=False),
        sa.Column('operation_type', sa.String(length=50), nullable=False),
        sa.Column('operation_detail', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['contract_id'], ['contract.id'], ),
        sa.ForeignKeyConstraint(['operator_id'], ['employee.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop contract_operation_log table
    op.drop_table('contract_operation_log')
    
    # Remove columns from contract table
    op.drop_column('contract', 'is_appendix')
    op.drop_column('contract', 'notes')
    op.drop_column('contract', 'parent_contract_id')