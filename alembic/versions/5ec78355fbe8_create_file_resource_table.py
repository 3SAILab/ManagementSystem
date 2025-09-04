"""create file_resource table

Revision ID: 5ec78355fbe8
Revises: b27aee7a55f2
Create Date: 2025-09-04 16:30:45.187940

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = '5ec78355fbe8'
down_revision: Union[str, Sequence[str], None] = 'b27aee7a55f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: 创建 file_resource 表"""
    
    # 创建表
    op.create_table(
        'file_resource',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('stored_filename', sa.String(length=255), nullable=False, unique=True),
        sa.Column('storage_path', sa.String(length=500), nullable=False),
        sa.Column(
            'uploaded_user_id',
            sa.Integer(),
            sa.ForeignKey('employee.id', ondelete='SET NULL'),
            nullable=True
        ),
        sa.Column('file_type', sa.String(length=100), nullable=True),
        sa.Column('file_size', sa.BigInteger(), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('upload_time', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )



def downgrade() -> None:
    """Downgrade schema: 删除表"""
    
    # 删除表
    op.drop_table('file_resource')