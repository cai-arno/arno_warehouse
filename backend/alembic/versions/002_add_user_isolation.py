"""添加用户隔离字段

Revision ID: 002_add_user_isolation
Revises: 001_initial
Create Date: 2026-04-03
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_add_user_isolation'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 脚本表添加 user_id
    op.add_column('scripts', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_index('ix_scripts_user_id', 'scripts', ['user_id'])
    op.create_foreign_key('fk_scripts_user_id', 'scripts', 'users', ['user_id'], ['id'])

    # 视频表添加 user_id
    op.add_column('videos', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_index('ix_videos_user_id', 'videos', ['user_id'])
    op.create_foreign_key('fk_videos_user_id', 'videos', 'users', ['user_id'], ['id'])

    # 素材表添加 user_id
    op.add_column('materials', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_index('ix_materials_user_id', 'materials', ['user_id'])
    op.create_foreign_key('fk_materials_user_id', 'materials', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    # 素材表
    op.drop_constraint('fk_materials_user_id', 'materials', type_='foreignkey')
    op.drop_index('ix_materials_user_id', 'materials')
    op.drop_column('materials', 'user_id')

    # 视频表
    op.drop_constraint('fk_videos_user_id', 'videos', type_='foreignkey')
    op.drop_index('ix_videos_user_id', 'videos')
    op.drop_column('videos', 'user_id')

    # 脚本表
    op.drop_constraint('fk_scripts_user_id', 'scripts', type_='foreignkey')
    op.drop_index('ix_scripts_user_id', 'scripts')
    op.drop_column('scripts', 'user_id')
