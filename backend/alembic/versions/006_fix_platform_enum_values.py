"""修复 platform 枚举值：统一为小写（与 enum value 一致）

问题：旧代码直接写入 enum value（'douyin'），新代码通过 SQLAlchemy 写入 enum name（'DOUYIN'），
导致读取时 LookupError。

修复：将数据库中的大写名称（DOUYIN, KUAISHOU, BILIBILI, XIGUA）改为小写值（douyin, kuaishou, bilibili, xigua）

Revision ID: 006_fix_platform_enum_values
Revises: 005_add_script_platform
Create Date: 2026-04-04
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '006_fix_platform_enum_values'
down_revision: Union[str, None] = '005_add_script_platform'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# 从 enum name → enum value 的映射
ENUM_NAME_TO_VALUE = {
    'DOUYIN': 'douyin',
    'KUAISHOU': 'kuaishou',
    'BILIBILI': 'bilibili',
    'XIGUA': 'xigua',
}


def upgrade() -> None:
    """将 platform 列的大写 enum name 改为小写 value"""
    for enum_name, enum_value in ENUM_NAME_TO_VALUE.items():
        op.execute(
            f"UPDATE scripts SET platform = '{enum_value}' WHERE platform = '{enum_name}'"
        )


def downgrade() -> None:
    """将 platform 列的小写 value 改回大写 name（仅作回滚参考）"""
    for enum_name, enum_value in ENUM_NAME_TO_VALUE.items():
        op.execute(
            f"UPDATE scripts SET platform = '{enum_name}' WHERE platform = '{enum_value}'"
        )
