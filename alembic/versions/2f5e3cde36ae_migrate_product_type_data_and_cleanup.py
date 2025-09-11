"""migrate_product_type_data_and_cleanup

Revision ID: 2f5e3cde36ae
Revises: 37e4a1531f9d
Create Date: 2025-09-07 16:08:05.944144

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f5e3cde36ae'
down_revision: Union[str, None] = '37e4a1531f9d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """数据迁移和字段清理"""
    
    # 1. 现有客户统一设为"其他"类型
    op.execute("""
        UPDATE client SET product_type_ids = ARRAY[
            (SELECT id FROM product_type WHERE name = '其他')
        ]
    """)
    
    # 2. 将客户的原始产品类型写入工单的产品名称字段
    op.execute("""
        UPDATE ticket 
        SET product_name = (
            SELECT c.product_type 
            FROM contract ct
            JOIN client c ON ct.client_id = c.id 
            WHERE ct.id = ticket.contract_id
        )
    """)
    
    # 3. 工单产品类型统一设为"其他"
    op.execute("""
        UPDATE ticket 
        SET product_type_id = (SELECT id FROM product_type WHERE name = '其他')
    """)
    
    # 4. 计算工单价格 (合同总价 / 总需求数量)
    op.execute("""
        UPDATE ticket 
        SET price = (
            SELECT 
                CASE 
                    WHEN (ct.detail_pages + ct.video_count + ct.image_count + ct.workflow_count) > 0 
                    THEN ROUND(ct.total_amount / (ct.detail_pages + ct.video_count + ct.image_count + ct.workflow_count), 2)
                    ELSE ct.total_amount  -- 假设为一份，整个合同价格
                END
            FROM contract ct
            WHERE ct.id = ticket.contract_id
        )
    """)
    
    # 5. 删除客户表的原产品类型字段
    op.drop_column('client', 'product_type')
    
    # 6. 添加数组查询索引
    op.execute("CREATE INDEX IF NOT EXISTS idx_client_product_type_ids ON client USING GIN (product_type_ids)")


def downgrade() -> None:
    """回滚数据迁移"""
    
    # 1. 删除索引
    op.execute("DROP INDEX IF EXISTS idx_client_product_type_ids")
    
    # 2. 恢复client.product_type字段
    op.add_column('client', sa.Column('product_type', sa.VARCHAR(length=100), nullable=True))
    
    # 3. 尝试从ticket.product_name恢复数据到client.product_type
    op.execute("""
        UPDATE client 
        SET product_type = (
            SELECT DISTINCT t.product_name 
            FROM ticket t
            JOIN contract ct ON t.contract_id = ct.id 
            WHERE ct.client_id = client.id 
            AND t.product_name IS NOT NULL
            LIMIT 1
        )
        WHERE EXISTS (
            SELECT 1 FROM ticket t
            JOIN contract ct ON t.contract_id = ct.id 
            WHERE ct.client_id = client.id 
            AND t.product_name IS NOT NULL
        )
    """)
    
    # 4. 清空新字段的数据
    op.execute("UPDATE ticket SET product_type_id = NULL, product_name = NULL, price = NULL")
    op.execute("UPDATE client SET product_type_ids = '{}'")