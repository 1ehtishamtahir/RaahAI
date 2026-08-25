from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "postgresql://raahai:raahai@localhost:5432/raahai"
    chroma_path: str = "./chroma_db"
    chroma_collection: str = "raahai_gov_docs"
    # Gemini (primary)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-lite-latest"
    gemini_embedding_model: str = "models/text-embedding-004"
    # Qwen legacy (fallback if Gemini not set)
    dashscope_api_key: str = ""
    qwen_model: str = "qwen-plus"
    qwen_embedding_model: str = "text-embedding-v2"
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    upload_dir: str = "./uploads"
    max_upload_mb: int = 10
    ocr_engine: str = "paddle"
    whisper_model: str = "base"
    secret_key: str = "raahai-hackathon-secret-key-2026"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache
def get_settings() -> Settings:
    return Settings()
