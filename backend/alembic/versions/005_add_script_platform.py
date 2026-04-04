"""添加脚本 platform 字段（支持平台差异化）

Revision ID: 005_add_script_platform
Revises: 004_add_template_user_id
Create Date: 2026-04-04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005_add_script_platform'
down_revision: Union[str, None] = '004_add_template_user_id'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 添加 platform 列，默认值为 'douyin'（兼容现有数据）
    op.add_column('scripts', sa.Column('platform', sa.String(length=20), nullable=False, server_default='douyin'))


def downgrade() -> None:
    op.drop_column('scripts', 'platform')
