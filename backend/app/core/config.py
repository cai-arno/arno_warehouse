"""应用配置"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置"""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_NAME: str = "短视频工厂 API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/shortvideo"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI Providers
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"

    # Alibaba Cloud (TTS)
    ALIYUN_ACCESS_KEY: str = ""
    ALIYUN_ACCESS_SECRET: str = ""
    ALIYUN_REGION: str = "cn-shanghai"

    # FFmpeg
    FFMPEG_PATH: str = "ffmpeg"
    FFPROBE_PATH: str = "ffprobe"

    # Storage
    OSS_ENDPOINT: str = ""
    OSS_ACCESS_KEY: str = ""
    OSS_ACCESS_SECRET: str = ""
    OSS_BUCKET: str = "shortvideo-assets"

    # Upload
    MAX_UPLOAD_SIZE: int = 500 * 1024 * 1024  # 500MB


settings = Settings()
