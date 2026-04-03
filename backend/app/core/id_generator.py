"""ID编码生成工具

规则：4位字母前缀 + 8位16进制顺序号，共12位
示例：USR_00000001, SCR_0000000A, VID_00000010
"""
import threading
import uuid
from typing import Callable

# 表前缀映射（固定4位，不足用0补）
PREFIX_MAP = {
    "users": "USR0",
    "scripts": "SCR0",
    "videos": "VID0",
    "materials": "MAT0",
    "templates": "TPL0",
    "publish_records": "PUB0",
}

# 每个表的顺序计数器（线程安全）
_counters: dict[str, int] = {}
_lock = threading.Lock()


def get_next_id(table_name: str) -> str:
    """生成下一个 ID"""
    prefix = PREFIX_MAP.get(table_name)
    if not prefix:
        raise ValueError(f"Unknown table: {table_name}")
    
    with _lock:
        current = _counters.get(table_name, 0)
        current += 1
        _counters[table_name] = current
        return f"{prefix}{current:08X}"  # 如 USR0000000000000001


def generate_id(table_name: str, sequential: bool = True) -> str:
    """生成 ID
    
    Args:
        table_name: 表名
        sequential: True=顺序号, False=UUID hex (用于临时ID/不依赖数据库的场景)
    """
    if sequential:
        return get_next_id(table_name)
    else:
        prefix = PREFIX_MAP.get(table_name, "XXX")
        # UUID的后8字节转hex
        uuid_hex = uuid.uuid4().hex[-8:].upper()
        return f"{prefix}{uuid_hex}"  # 如 USR3A7F2B1C


def extract_counter_from_id(id_str: str) -> int | None:
    """从ID字符串提取顺序号（用于排序）"""
    if "_" in id_str:
        hex_part = id_str.split("_")[1]
        try:
            return int(hex_part, 16)
        except ValueError:
            return None
    return None


def get_table_from_id(id_str: str) -> str | None:
    """从ID字符串获取表名"""
    if "_" in id_str:
        prefix = id_str.split("_")[0]
        for table, p in PREFIX_MAP.items():
            if p.rstrip("_") == prefix:
                return table
    return None
