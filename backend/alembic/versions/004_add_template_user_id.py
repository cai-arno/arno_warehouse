"""添加模板 user_id 字段

Revision ID: 004_add_template_user_id
Revises: 003_assign_existing_data_to_user
Create Date: 2026-04-03
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_add_template_user_id'
down_revision: Union[str, None] = '003_assign_existing_data_to_user'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('templates', sa.Column('user_id', sa.String(length=12), nullable=True))
    op.create_index('ix_templates_user_id', 'templates', ['user_id'])
    op.create_foreign_key('fk_templates_user_id', 'templates', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_templates_user_id', 'templates', type_='foreignkey')
    op.drop_index('ix_templates_user_id', 'templates')
    op.drop_column('templates', 'user_id')
