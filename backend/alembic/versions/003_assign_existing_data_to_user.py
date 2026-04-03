"""将现有数据归属到指定用户

Revision ID: 003_assign_existing_data_to_user
Revises: 002_add_user_isolation
Create Date: 2026-04-03

部署步骤：
1. 确认数据库迁移已执行 (alembic upgrade head)
2. 确认手机号 18180769518 的用户 ID
3. 如果用户不存在，先用手机号登录创建用户
4. 运行以下 SQL（把 :user_id 替换为实际用户 ID）：
   
   UPDATE scripts SET user_id = :user_id WHERE user_id IS NULL;
   UPDATE videos SET user_id = :user_id WHERE user_id IS NULL;
   UPDATE materials SET user_id = :user_id WHERE user_id IS NULL;
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_assign_existing_data_to_user'
down_revision: Union[str, None] = '002_add_user_isolation'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    注意：这个迁移不会自动设置 user_id，
    因为需要先确认 18180769518 用户的 ID。
    
    请手动执行 SQL：
    UPDATE scripts SET user_id = <用户ID> WHERE user_id IS NULL;
    UPDATE videos SET user_id = <用户ID> WHERE user_id IS NULL;
    UPDATE materials SET user_id = <用户ID> WHERE user_id IS NULL;
    """
    pass


def downgrade() -> None:
    op.execute("UPDATE scripts SET user_id = NULL WHERE user_id IS NOT NULL")
    op.execute("UPDATE videos SET user_id = NULL WHERE user_id IS NOT NULL")
    op.execute("UPDATE materials SET user_id = NULL WHERE user_id IS NOT NULL")
