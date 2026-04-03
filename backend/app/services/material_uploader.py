"""素材上传服务"""
import json
import uuid
import asyncio
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.material import Material, MaterialType
from app.core.config import settings


class MaterialUploader:
    """素材上传处理器"""

    # 本地存储路径（生产环境应使用 OSS）
    LOCAL_STORAGE_PATH = "/tmp/shortvideo_uploads"

    def __init__(self, session: AsyncSession):
        self.session = session

    async def upload(
        self,
        file: UploadFile,
        material_type: MaterialType,
        name: str,
        category: str = "",
        tags: str = "[]",
        user_id: int | None = None,
    ) -> Material:
        """上传素材文件"""
        # 生成唯一文件名
        ext = file.filename.split(".")[-1] if "." in file.filename else ""
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        file_path = f"{self.LOCAL_STORAGE_PATH}/{material_type.value}/{unique_name}"

        # 保存文件
        content = await file.read()
        import os
        os.makedirs(f"{self.LOCAL_STORAGE_PATH}/{material_type.value}", exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(content)

        # 提取元数据
        width, height, duration = 0, 0, 0
        file_size = len(content)

        if material_type in (MaterialType.VIDEO, MaterialType.IMAGE):
            width, height = await self._get_image_dimensions(content[:100], ext)
        if material_type in (MaterialType.VIDEO, MaterialType.AUDIO, MaterialType.VOICEOVER):
            duration = await self._get_media_duration(file_path)

        # 创建素材记录
        material = Material(
            name=name,
            material_type=material_type,
            file_path=file_path,
            oss_url=f"/uploads/{material_type.value}/{unique_name}",  # 演示用本地URL
            file_size=file_size,
            duration=duration,
            width=width,
            height=height,
            tags=tags,
            category=category,
            user_id=user_id or 0,
        )
        self.session.add(material)
        await self.session.commit()
        await self.session.refresh(material)
        return material

    async def _get_image_dimensions(self, header: bytes, ext: str) -> tuple[int, int]:
        """从文件头获取图片尺寸"""
        # 简化实现，实际应使用 Pillow
        return (1920, 1080)  # 默认 1080p

    async def _get_media_duration(self, file_path: str) -> float:
        """获取音视频时长"""
        # TODO: 使用 ffprobe 获取真实时长
        return 0.0
